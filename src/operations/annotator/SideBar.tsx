import { useLoadingHandler } from '@/common/hooks';
import { useAnnotatorComponentStore, useCanvasAnnotationContext } from '@/common/store';
import { parseUrlParams, printError } from '@/common/utils';
import { clearPolygons } from '@/providers';
import { annotatorProvider } from '@/providers/annotator-provider';
import { annotationsAttributeMapper, annotatorMapper } from '@/providers/mappers';
import { Inbox as InboxIcon } from '@mui/icons-material';
import { Box, Dialog, DialogContent, List, Typography } from '@mui/material';
import { BaseSyntheticEvent, FC } from 'react';
import { useNotify, useRedirect } from 'react-admin';
import { FormProvider, useFormContext } from 'react-hook-form';
import { v4 as uuidV4 } from 'uuid';

import { AnnotationSlopeHeightAlert, AnnotatorFormItem, AnnotatorFormResultItem } from './components';
import { AnnotationInfo } from './types';

export type SideBarProps = {
  draftAnnotationId?: string;
  defaultAnnotationInfos: AnnotationInfo[];
};

export const SideBar: FC<SideBarProps> = ({ draftAnnotationId }) => {
  const redirect = useRedirect();
  const notify = useNotify();
  const { pictureId, imgUrl } = parseUrlParams();
  const { polygons, slopeInfoOpen, handleSlopeInfoToggle, fieldArrayState } = useCanvasAnnotationContext();
  const formState = useFormContext();
  const { startLoading, stopLoading } = useLoadingHandler();
  const { slopeAndHeightState, areaPictureDetails } = useAnnotatorComponentStore();

  const handleSubmitFormsWrapper = (event: BaseSyntheticEvent, isDraft: boolean) => {
    const handleSubmitForms = formState.handleSubmit(async ({ annotationInfos }) => {
      try {
        startLoading();
        const annotationIdValue = draftAnnotationId || uuidV4();
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
    <Box>
      <List sx={{ pb: '50px', maxHeight: window.innerHeight * 0.9, overflow: 'auto' }}>
        <Box py={2}>
          <AnnotationSlopeHeightAlert status={slopeAndHeightState?.heightStatus} />
          {fieldArrayState.fields.length > 0 ? (
            <form onSubmit={event => handleSubmitFormsWrapper(event, false)}>
              <FormProvider {...formState}>
                {fieldArrayState.fields.map((annotationInfo: any, i: number) =>
                  annotationInfo?.polygonId?.includes('___') ? (
                    <AnnotatorFormResultItem index={i} annotationInfo={annotationInfo} areaPictureDetails={areaPictureDetails} key={annotationInfo.id + i} />
                  ) : (
                    <AnnotatorFormItem annotationInfo={annotationInfo} index={i} key={annotationInfo.id + i} />
                  )
                )}
              </FormProvider>
            </form>
          ) : (
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
        {slopeInfoOpen && (
          <Dialog open={slopeInfoOpen} onClose={handleSlopeInfoToggle}>
            <DialogContent>
              <img src='/pentes/calcul.png' alt='Diagramme illustrant le calcul de la pente du toit' width={'100%'} />
            </DialogContent>
          </Dialog>
        )}
      </List>
    </Box>
  );
};
