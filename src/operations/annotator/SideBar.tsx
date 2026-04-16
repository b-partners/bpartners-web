import { useLoadingHandler } from '@/common/hooks';
import { annotatorStore, useAnnotatorComponentStore } from '@/common/store';
import { parseUrlParams, printError } from '@/common/utils';
import { clearPolygons } from '@/providers';
import { annotatorProvider } from '@/providers/annotator-provider';
import { annotationsAttributeMapper, annotatorMapper } from '@/providers/mappers';
import { Inbox as InboxIcon } from '@mui/icons-material';
import { Box, List, Stack, Typography } from '@mui/material';
import { BaseSyntheticEvent, FC } from 'react';
import { useNotify, useRedirect } from 'react-admin';
import { useFormContext } from 'react-hook-form';
import { v4 as uuidV4 } from 'uuid';

import { AnnotationSlopeHeightAlert, AnnotatorFormItem, AnnotatorFormResultItem } from './components';
import { AnnotatorFormState, isAfterAnalyse } from './utils';

export type SideBarProps = {
  draftAnnotationId?: string;
};

const AnnotatorItemList = () => {
  const { areaPictureDetails } = useAnnotatorComponentStore();

  const annotationsInfos = annotatorStore.useAnnotatorInfoStore();
  const { polygonList } = annotatorStore.usePolygonStore();

  const isAfterAnalyseValue = isAfterAnalyse(polygonList);

  return annotationsInfos.map(annotationInfo =>
    annotationInfo?.polygonId?.includes('___') ? (
      <AnnotatorFormResultItem
        isAfterAnalyse={isAfterAnalyseValue}
        areaPictureDetails={areaPictureDetails}
        key={`${annotationInfo.polygonId}_AnnotatorFormResultItem`}
        polygonId={annotationInfo.polygonId}
      />
    ) : (
      <AnnotatorFormItem isAfterAnalyse={isAfterAnalyseValue} polygonId={annotationInfo.polygonId} key={`${annotationInfo.polygonId}_AnnotatorFormItem`} />
    )
  );
};

export const SideBar: FC<SideBarProps> = ({ draftAnnotationId }) => {
  const redirect = useRedirect();
  const notify = useNotify();
  const { pictureId, imgUrl } = parseUrlParams();
  const formState = useFormContext<AnnotatorFormState>();
  const { startLoading, stopLoading } = useLoadingHandler();
  const { slopeAndHeightState } = useAnnotatorComponentStore();

  const handleSubmitFormsWrapper = (event: BaseSyntheticEvent, isDraft: boolean) => {
    const handleSubmitForms = formState.handleSubmit(async ({ annotationInfos }) => {
      try {
        startLoading();
        const annotationIdValue = draftAnnotationId || uuidV4();
        const annotationAttributeMapped = annotationsAttributeMapper(formState.getValues('polygons'), annotationInfos, pictureId, annotationIdValue);
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

  const annotationList = AnnotatorItemList();

  return (
    <List sx={{ pb: '50px', maxHeight: window.innerHeight * 0.9, overflow: 'auto', pr: 1 }}>
      <Box py={2}>
        <AnnotationSlopeHeightAlert status={slopeAndHeightState?.heightStatus} />
        <form onSubmit={event => handleSubmitFormsWrapper(event, false)}>
          <Stack component='form' gap={1}>
            {annotationList}
          </Stack>
        </form>
        {annotationList.length === 0 && (
          <Box display='flex' color='#00000050' marginTop='2rem' width='100%' alignItems='center' flexDirection='column'>
            <div>
              <InboxIcon sx={{ fontSize: '6rem' }} />
            </div>
            <Typography width={200} textAlign='center'>
              Aucune annotation n'a encore été effectuée.
            </Typography>
          </Box>
        )}
      </Box>
    </List>
  );
};
