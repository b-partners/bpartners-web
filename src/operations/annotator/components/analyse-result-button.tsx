import { BPButton } from '@/common/components';
import { useAnnotatorImageUploadQuery } from '@/common/fetcher';
import { useLoadingHandler } from '@/common/hooks';
import { useAnnotatorComponentStore } from '@/common/store';
import { getFileUrl, parseUrlParams, printError, UrlParams } from '@/common/utils';
import {
  AnnotationCoveringFromAnalyse,
  annotationsAttributeMapper,
  annotatorMapper,
  annotatorProvider,
  cache,
  clearPolygons,
  getCached,
  SlopeAndHeightStatus,
} from '@/providers';
import { AreaPictureAnnotation, AreaPictureDetails } from '@bpartners/typescript-client';
import { Stack } from '@mui/material';
import { BaseSyntheticEvent, FC, useEffect, useState } from 'react';
import { useNotify, useRedirect } from 'react-admin';
import { useFormContext } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { v4 } from 'uuid';
import { analyseResultButtonsStyle } from '../style';
import { AnnotatorFormState } from '../utils';
import { ExportAnnotationConfirmButton } from './ExportAnnotationConfirmButton';

export interface AnalyseProperties {
  obstacle: boolean;
  usure_rate: number;
  global_rate_value: number;
  global_rate_type: string;
  moisissure_rate: number;
  humidite_rate: number;
  roof_area_in_m2: number;
  revetement_1: AnnotationCoveringFromAnalyse;
  revetement_2: AnnotationCoveringFromAnalyse | null;
  roof_height_data_status: SlopeAndHeightStatus;
  roof_slope_data_status: SlopeAndHeightStatus;
  roof_slope_in_degrees: number;
  roof_height_in_meters: number;
}

export type AnalyseResultButtonProps = {
  draftAnnotationId?: string;
  areaPictureDetails: AreaPictureDetails;
  image: string;
  isCropped: boolean;
  analyseProperties: AnalyseProperties;
};

export const AnalyseResultButton: FC<AnalyseResultButtonProps> = ({ draftAnnotationId, areaPictureDetails, image, isCropped, analyseProperties }) => {
  const redirect = useRedirect();
  const notify = useNotify();
  const { pictureId, imgUrl } = parseUrlParams();
  const annotatorFormState = useFormContext<AnnotatorFormState>();
  const { isLoading, startLoading, stopLoading } = useLoadingHandler();
  const formState = useFormContext();
  const { mutateAsync: uploadImage } = useAnnotatorImageUploadQuery();
  const [isThereAnyPolygons, setIsThereAnyPolygons] = useState(false);
  const navigate = useNavigate();

  const annotatorComponentStore = useAnnotatorComponentStore();

  useEffect(() => {
    const observer = annotatorFormState.watch(({ polygons }) => {
      if (polygons.length > 0 && !isThereAnyPolygons) setIsThereAnyPolygons(true);
      else if (polygons.length === 0 && isThereAnyPolygons) setIsThereAnyPolygons(false);
    });

    return observer.unsubscribe;
  }, []);

  const handleReturnToBegin = () => {
    const fileUrl = UrlParams.get('imgUrl');
    const address = UrlParams.get('address');
    const zoomLevel = UrlParams.get('zoomLevel');
    const pictureId = UrlParams.get('pictureId');
    const prospectId = UrlParams.get('prospectId');
    const fileId = UrlParams.get('fileId');

    clearPolygons(true);
    annotatorComponentStore.reset();
    cache.loadingRedirection(
      `/annotator?` +
        `imgUrl=${encodeURIComponent(fileUrl)}` +
        `&address=${address}` +
        `&zoomLevel=${zoomLevel}` +
        `&pictureId=${pictureId}` +
        `&useDrafts=false` +
        `&prospectId=${prospectId}` +
        `&fileId=${fileId}`
    );
    navigate(`/loading`);
  };

  const handleSubmitFormsWrapper = (event: BaseSyntheticEvent, isDraft: boolean) => {
    const handleSubmitForms = formState.handleSubmit(async ({ annotationInfos }) => {
      try {
        startLoading();
        isCropped && (await uploadImage({ file: image, id: areaPictureDetails.fileId }));
        const annotationIdValue = draftAnnotationId || v4();
        const annotationAttributeMapped = annotationsAttributeMapper(annotatorFormState.getValues('polygons'), annotationInfos, pictureId, annotationIdValue);
        const requestBody: AreaPictureAnnotation = {
          ...annotatorMapper(annotationAttributeMapped, pictureId, annotationIdValue, isDraft),
          properties: {
            global_rate_type: analyseProperties.global_rate_type,
            global_rate_value: analyseProperties.global_rate_value,
            roofHeight: analyseProperties.roof_height_in_meters,
            llm: getCached.llmResult(),
          },
        };
        await annotatorProvider.annotatePicture(pictureId, annotationIdValue, requestBody);
        clearPolygons();
        if (isDraft) {
          notify('resources.draftsAnnotations.creation.success', { type: 'success' });
          redirect('/prospects?tab=drafts');
          return;
        }
        redirect(
          'list',
          `invoices?imgUrl=${isCropped ? getFileUrl(areaPictureDetails.fileId, 'AREA_PICTURE') : encodeURIComponent(imgUrl)}&pictureId=${pictureId}&annotationId=${annotationIdValue}&showCreateQuote=true`
        );
      } catch (e) {
        printError(e);
        notify('resources.annotations.creation.error', { type: 'error' });
      } finally {
        stopLoading();
      }
    });
    handleSubmitForms(event);
  };

  return (
    <Stack direction='row' sx={analyseResultButtonsStyle} gap={1}>
      <BPButton
        type='submit'
        className='invoice-gen-btn'
        isLoading={isLoading}
        data-testid='submit-annotator-form'
        onClick={handleReturnToBegin}
        label='resources.annotator.returnToBegin'
      />
      <BPButton
        isLoading={isLoading}
        className='draft-save-btn'
        disabled={isLoading || !isThereAnyPolygons}
        label='resources.draftsAnnotations.add'
        data-testid='submit-draft-annotation'
        onClick={event => handleSubmitFormsWrapper(event, true)}
      />
      <ExportAnnotationConfirmButton areaPictureDetails={areaPictureDetails} image={image} isCropped={isCropped} disabled={!isThereAnyPolygons} />
    </Stack>
  );
};
