import { BPConstruction, FlexBox } from '@/common/components';
import { BPButton } from '@/common/components/BPButton';
import { useLoadingHandler } from '@/common/hooks';
import { useCanvasAnnotationContext } from '@/common/store';
import { parseUrlParams, printError } from '@/common/utils';
import { labels } from '@/constants';
import { clearPolygons } from '@/providers';
import { annotatorProvider } from '@/providers/annotator-provider';
import { annotationsAttributeMapper, annotatorMapper } from '@/providers/mappers';
import { Delete as DeleteIcon, ExpandMore, Inbox as InboxIcon, Visibility as VisibilityIcon, VisibilityOff as VisibilityOffIcon } from '@mui/icons-material';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Dialog,
  DialogContent,
  Divider,
  IconButton,
  List,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { BaseSyntheticEvent, ChangeEvent, FC, useState } from 'react';
import { SelectInput, TextInput, useNotify, useRedirect } from 'react-admin';
import { FormProvider } from 'react-hook-form';
import { v4 as uuidV4 } from 'uuid';

import { ZoomLevel } from '@bpartners/typescript-client';
import AnnotatorForm from './components/AnnotatorForm';
import { AnnotationInfo } from './types';
import { useAnnotationInfosForm } from './utils/annotations-info-form';

export type SideBarProps = {
  draftAnnotationId?: string;
  defaultAnnotationInfos: AnnotationInfo[];
};

export const SideBar: FC<SideBarProps> = ({ draftAnnotationId, defaultAnnotationInfos }) => {
  const redirect = useRedirect();
  const notify = useNotify();
  const { pictureId, imgUrl, address } = parseUrlParams();
  const { polygons, slopeInfoOpen, setPolygons, handleSlopeInfoToggle } = useCanvasAnnotationContext();
  const { isLoading, startLoading, stopLoading } = useLoadingHandler();
  const [expanded, setExpanded] = useState<number | null>(0);
  const { formState, fieldArrayState } = useAnnotationInfosForm(polygons, defaultAnnotationInfos);

  const exportAnalayse = () => {
    redirect(
      `/export-analyse-preview?imgUrl=${encodeURIComponent(imgUrl)}&useDrafts=${draftAnnotationId ? 'true' : 'false'}&address=${address}&zoomLevel=${ZoomLevel.HOUSES_0}&pictureId=${pictureId}`
    );
  };

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

  const togglePolygonVisibility = (polygonId: string) => {
    setPolygons(prev => prev.map(polygon => (polygon.id === polygonId ? { ...polygon, isInvisible: !polygon.isInvisible } : polygon)));
  };

  const handleClickAccordion = (index: number) => (_event: ChangeEvent<unknown>, isExpanded: boolean) => {
    setExpanded(isExpanded ? index : null);
  };

  const removeAnnotationByPolygonId = (polygonId: string) => {
    setPolygons(prev => prev.filter(polygon => polygon.id !== polygonId));
  };

  return (
    <>
      <List sx={{ pb: '50px', maxHeight: window.innerHeight * 0.7, overflow: 'auto' }}>
        <Box py={2}>
          {fieldArrayState.fields.length > 0 ? (
            <FormProvider {...formState}>
              <form onSubmit={event => handleSubmitFormsWrapper(event, false)}>
                {fieldArrayState.fields.map((annotationInfo, i) => {
                  const currentPolygon = polygons.find(polygon => polygon.id === annotationInfo.polygonId);

                  if (!currentPolygon) {
                    return null;
                  }

                  return (
                    <Box data-cy='annotation-info-item' key={annotationInfo.id}>
                      <FlexBox sx={{ alignItems: 'start', width: '100%', mt: '15px' }}>
                        <Tooltip title={currentPolygon.isInvisible ? 'Afficher le polygone' : 'Cacher le polygone'}>
                          <IconButton
                            edge='end'
                            aria-label='toggle polygon visibility'
                            style={{ marginRight: '0' }}
                            onClick={() => togglePolygonVisibility(currentPolygon.id)}
                          >
                            {currentPolygon.isInvisible ? <VisibilityIcon /> : <VisibilityOffIcon />}
                          </IconButton>
                        </Tooltip>
                        <SelectInput
                          alwaysOn
                          resettable
                          choices={labels}
                          label='Type de label'
                          sx={{ width: '70%', m: 0 }}
                          name={`annotationInfos.${i}.labelType`}
                          source={`annotationInfos.${i}.labelType`}
                        />
                        <Tooltip title='supprimer le polygone'>
                          <IconButton aria-label='delete polygon' edge='end' onClick={() => removeAnnotationByPolygonId(currentPolygon.id)}>
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </FlexBox>
                      <Accordion style={{ marginTop: '-15px', marginBottom: '50px' }} expanded={expanded === i} onChange={handleClickAccordion(i)}>
                        <AccordionSummary expandIcon={<ExpandMore />}>
                          <TextInput
                            name={`annotationInfos.${i}.labelName`}
                            source={`annotationInfos.${i}.labelName`}
                            inputProps={{
                              'data-cy': 'label-name-input',
                            }}
                            onClick={e => e.stopPropagation()}
                            label={'Nom du label'}
                            helperText={false}
                          />
                        </AccordionSummary>
                        <AccordionDetails>
                          <AnnotatorForm index={i} surface={currentPolygon.surface} />
                        </AccordionDetails>
                      </Accordion>
                      <Divider />
                    </Box>
                  );
                })}
              </form>
            </FormProvider>
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
      <Stack sx={{ zIndex: 99999, position: 'absolute', bottom: 20, width: '100%', bgcolor: 'white' }} spacing={2}>
        <BPButton
          type='submit'
          isLoading={isLoading}
          data-testid='submit-annotator-form'
          onClick={event => handleSubmitFormsWrapper(event, false)}
          label='resources.annotator.save'
          style={{ width: '100%' }}
        />
        <BPButton
          isLoading={isLoading}
          disabled={isLoading || polygons.length === 0}
          label='resources.draftsAnnotations.add'
          data-testid='submit-draft-annotation'
          onClick={event => handleSubmitFormsWrapper(event, true)}
          style={{ width: '100%' }}
        />
        <BPButton
          type='button'
          style={{ width: '100%' }}
          onClick={exportAnalayse}
          isLoading={isLoading}
          disabled={isLoading || polygons.length === 0}
          label='resources.draftsAnnotations.export'
          data-testid='submit-annotation-export'
        />
        <BPConstruction sx={{ width: '100%' }} />
      </Stack>
    </>
  );
};
