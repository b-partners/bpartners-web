import { BPButton } from '@/common/components';
import { useLoadingHandler } from '@/common/hooks';
import { useCanvasAnnotationContext } from '@/common/store';
import { parseUrlParams, printError } from '@/common/utils';
import { annotationsAttributeMapper, annotatorMapper, annotatorProvider, clearPolygons } from '@/providers';
import { Stack } from '@mui/material';
import { BaseSyntheticEvent, FC } from 'react';
import { useNotify, useRedirect } from 'react-admin';
import { v4 } from 'uuid';
import { analyseResultButtonsStyle } from '../style';
import { AnnotationInfo } from '../types';
import { useAnnotationInfosForm } from '../utils';
import { ExportAnnotationConfirmButton } from './ExportAnnotationConfirmButton';

export type AnalyseResultButtonProps = {
  draftAnnotationId?: string;
  defaultAnnotationInfos: AnnotationInfo[];
};

export const AnalyseResultButton: FC<AnalyseResultButtonProps> = ({ defaultAnnotationInfos, draftAnnotationId }) => {
  const redirect = useRedirect();
  const notify = useNotify();
  const { pictureId, imgUrl } = parseUrlParams();
  const { polygons, roofAnalyseProperties } = useCanvasAnnotationContext();
  const { isLoading, startLoading, stopLoading } = useLoadingHandler();
  const { formState } = useAnnotationInfosForm(polygons, defaultAnnotationInfos, roofAnalyseProperties);

  const handleSubmitFormsWrapper = (event: BaseSyntheticEvent, isDraft: boolean) => {
    const handleSubmitForms = formState.handleSubmit(async ({ annotationInfos }) => {
      try {
        startLoading();
        const annotationIdValue = draftAnnotationId || v4();
        const annotationAttributeMapped = annotationsAttributeMapper(polygons, annotationInfos, pictureId, annotationIdValue);
        const requestBody = annotatorMapper(annotationAttributeMapped, pictureId, annotationIdValue, isDraft);
        await annotatorProvider.annotatePicture(pictureId, annotationIdValue, requestBody);
        clearPolygons();
        if (isDraft) {
          notify('resources.draftsAnnotations.creation.success', { type: 'success' });
          redirect('/prospects?tab=drafts');
          return;
        }
        redirect('list', `invoices?imgUrl=${encodeURIComponent(imgUrl)}&pictureId=${pictureId}&annotationId=${annotationIdValue}&showCreateQuote=true`);
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
    <Stack direction='row' sx={analyseResultButtonsStyle}>
      <BPButton
        type='submit'
        className='invoice-gen-btn'
        isLoading={isLoading}
        data-testid='submit-annotator-form'
        onClick={event => handleSubmitFormsWrapper(event, false)}
        label='resources.annotator.save'
      />
      <BPButton
        isLoading={isLoading}
        className='draft-save-btn'
        disabled={isLoading || polygons.length === 0}
        label='resources.draftsAnnotations.add'
        data-testid='submit-draft-annotation'
        onClick={event => handleSubmitFormsWrapper(event, true)}
      />
      <ExportAnnotationConfirmButton formState={formState} />
    </Stack>
  );
};
