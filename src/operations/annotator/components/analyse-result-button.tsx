import { BPButton } from '@/common/components';
import { useLoadingHandler } from '@/common/hooks';
import { annotatorStore, useAnnotatorComponentStore } from '@/common/store';
import { getFileUrl, parseUrlParams, printError } from '@/common/utils';
import {
  AnnotationCoveringFromAnalyse,
  annotationsAttributeMapper,
  annotatorMapper,
  annotatorProvider,
  clearPolygons,
  getCached,
  SlopeAndHeightStatus,
} from '@/providers';
import { AreaPictureAnnotation, AreaPictureDetails } from '@bpartners/typescript-client';
import { Stack, SxProps } from '@mui/material';
import { FC } from 'react';
import { useNotify, useRedirect } from 'react-admin';
import { v4 } from 'uuid';
import { analyseResultButtonsStyle } from '../style';
import { calculateGlobalRate } from '../utils';
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
  width: number | string;
  show: boolean;
  rebeginAreaPictureDetails: () => void;
};

export const AnalyseResultButton: FC<AnalyseResultButtonProps> = ({
  draftAnnotationId,
  areaPictureDetails,
  image,
  isCropped,
  analyseProperties,
  width,
  show,
  rebeginAreaPictureDetails,
}) => {
  const redirect = useRedirect();
  const notify = useNotify();
  const { pictureId, imgUrl } = parseUrlParams();
  const { llm } = useAnnotatorComponentStore();
  const globalRate = calculateGlobalRate();
  const annotatorsInfos = annotatorStore.useAnnotatorInfoStore();
  const { polygonList } = annotatorStore.usePolygonStore();

  const { isLoading, startLoading, stopLoading } = useLoadingHandler();

  const isThereAnyPolygons = annotatorsInfos.length > 0;

  if (!show) return null;

  const handleSubmitFormsWrapper = (isDraft: boolean) => {
    const handleSubmitForms = async () => {
      try {
        startLoading();
        const annotationIdValue = draftAnnotationId || v4();
        const annotationAttributeMapped = annotationsAttributeMapper(polygonList, annotatorsInfos, pictureId, annotationIdValue);
        const roofDelimiterLongLat = getCached.roofDelimiterLongLatItem();
        const requestBody: AreaPictureAnnotation = {
          ...annotatorMapper(annotationAttributeMapped, pictureId, annotationIdValue, isDraft),
          properties: {
            global_rate_type: analyseProperties?.global_rate_type || globalRate?.type,
            global_rate_value: analyseProperties?.global_rate_value || globalRate?.value,
            roofHeight: analyseProperties?.roof_height_in_meters || annotatorsInfos[0].height,
            llm: getCached.llmResult() || llm,
            roofDelimiter: roofDelimiterLongLat,
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
    };
    handleSubmitForms();
  };

  const style: SxProps = { ...analyseResultButtonsStyle, width };

  return (
    <Stack direction='row' sx={style} gap={1}>
      <BPButton
        className='invoice-gen-btn'
        isLoading={isLoading}
        data-testid='submit-annotator-form'
        onClick={rebeginAreaPictureDetails}
        label='resources.annotator.returnToBegin'
      />
      <BPButton
        isLoading={isLoading}
        className='draft-save-btn'
        disabled={isLoading || !isThereAnyPolygons}
        label='resources.draftsAnnotations.add'
        data-testid='submit-draft-annotation'
        onClick={() => handleSubmitFormsWrapper(true)}
      />
      <ExportAnnotationConfirmButton areaPictureDetails={areaPictureDetails} image={image} isCropped={isCropped} disabled={!isThereAnyPolygons} />
    </Stack>
  );
};
