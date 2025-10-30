import { useLoadingHandler } from '@/common/hooks';
import { useAnnotatorComponentStore } from '@/common/store';
import { parseUrlParams, printError } from '@/common/utils';
import { clearPolygons } from '@/providers';
import { annotatorProvider } from '@/providers/annotator-provider';
import { annotationsAttributeMapper, annotatorMapper } from '@/providers/mappers';
import { Inbox as InboxIcon } from '@mui/icons-material';
import { Box, List, Typography } from '@mui/material';
import React, { BaseSyntheticEvent, FC, useEffect, useState } from 'react';
import { useNotify, useRedirect } from 'react-admin';
import { useFormContext, useWatch } from 'react-hook-form';
import { v4 as uuidV4 } from 'uuid';

import { Polygon } from '@bpartners/annotator-component';
import { AnnotationSlopeHeightAlert, AnnotatorFormItem, AnnotatorFormResultItem } from './components';
import { AnnotatorFormState } from './utils';

export type SideBarProps = {
  draftAnnotationId?: string;
};

const AnnotatorItemList = React.memo(() => {
  const { annotationInfos, polygons } = useWatch<AnnotatorFormState>();
  const { areaPictureDetails } = useAnnotatorComponentStore();

  return annotationInfos.map((annotationInfo, index: number) =>
    annotationInfo?.polygonId?.includes('___') ? (
      <AnnotatorFormResultItem
        index={index}
        annotationInfo={annotationInfo}
        areaPictureDetails={areaPictureDetails}
        key={`${annotationInfo.polygonId}_AnnotatorFormResultItem`}
        polygon={polygons[index] as Polygon}
      />
    ) : (
      <AnnotatorFormItem
        annotationInfo={annotationInfo}
        index={index}
        key={`${annotationInfo.polygonId}_AnnotatorFormItem`}
        polygon={polygons[index] as Polygon}
      />
    )
  );
});

export const SideBar: FC<SideBarProps> = ({ draftAnnotationId }) => {
  const redirect = useRedirect();
  const notify = useNotify();
  const { pictureId, imgUrl } = parseUrlParams();
  const formState = useFormContext<AnnotatorFormState>();
  const { startLoading, stopLoading } = useLoadingHandler();
  const { slopeAndHeightState } = useAnnotatorComponentStore();
  const [isThereAnyAnnotationInfos, setIsThereAnyAnnotationInfos] = useState(false);

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

  useEffect(() => {
    const observer = formState.watch(({ annotationInfos }) => {
      if (annotationInfos.length > 0 && !isThereAnyAnnotationInfos) setIsThereAnyAnnotationInfos(true);
      else if (annotationInfos.length === 0 && isThereAnyAnnotationInfos) setIsThereAnyAnnotationInfos(false);
    });

    return observer.unsubscribe;
  }, []);

  return (
    <Box>
      <List sx={{ pb: '50px', maxHeight: window.innerHeight * 0.9, overflow: 'auto' }}>
        <Box py={2}>
          <AnnotationSlopeHeightAlert status={slopeAndHeightState?.heightStatus} />
          <form onSubmit={event => handleSubmitFormsWrapper(event, false)}>
            <AnnotatorItemList />
          </form>
          {!isThereAnyAnnotationInfos && (
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
    </Box>
  );
};
