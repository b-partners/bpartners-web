import { Polygon } from '@bpartners/annotator-component';
import { Delete as DeleteIcon, ExpandMore, Inbox as InboxIcon, Visibility as VisibilityIcon, VisibilityOff as VisibilityOffIcon } from '@mui/icons-material';

import { BPConstruction } from '@/common/components';
import { BPButton } from '@/common/components/BPButton';
import { useAnnotationsInfoForm } from '@/common/forms';
import { useCanvasAnnotationContext } from '@/common/store/annotator/Canvas-annotation-store';
import { parseUrlParams } from '@/common/utils';
import { labels } from '@/constants';
import { Alphabet } from '@/constants/alphabet';
import { clearPolygons } from '@/providers';
import { annotatorProvider } from '@/providers/annotator-provider';
import { annotationsAttributeMapper, annotatorMapper } from '@/providers/mappers';
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
import { ChangeEvent, useState } from 'react';
import { SelectInput, TextInput, useRedirect } from 'react-admin';
import { FormProvider } from 'react-hook-form';
import { v4 as uuidV4 } from 'uuid';
import AnnotatorForm from './components/AnnotatorForm';

const SideBar = () => {
  const redirect = useRedirect();
  const { polygons, setPolygons, slopeInfoOpen, handleSlopeInfoToggle } = useCanvasAnnotationContext();
  const annotationId = uuidV4();
  const { pictureId, imgUrl } = parseUrlParams();
  const [isLoading, setIsLoading] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(0);

  const formState = useAnnotationsInfoForm(polygons);

  const handleSubmitForms = formState.handleSubmit(async data => {
    setIsLoading(true);
    const annotationAttributeMapped = annotationsAttributeMapper(data, polygons, pictureId, annotationId);
    const requestBody = annotatorMapper(annotationAttributeMapped, pictureId, annotationId);

    await annotatorProvider.annotatePicture(pictureId, annotationId, requestBody);
    setIsLoading(false);
    clearPolygons();
    redirect('list', `invoices?imgUrl=${encodeURIComponent(imgUrl)}&pictureId=${pictureId}&annotationId=${annotationId}&showCreateQuote=true`);
  });

  const removeAnnotation = (polygonId: string) => {
    setPolygons((prev: Polygon[]) => prev.filter((polygon: Polygon) => polygon.id !== polygonId));
  };

  const togglePolygonVisibility = (polygonId: string) => {
    setPolygons((prev: Polygon[]) => prev.map((polygon: Polygon) => (polygon.id === polygonId ? { ...polygon, isInvisible: !polygon.isInvisible } : polygon)));
  };

  const handleClickAccordion = (index: number) => (_event: ChangeEvent<{}>, isExpanded: boolean) => {
    setExpanded(isExpanded ? index : null);
  };

  return (
    <>
      <List sx={{ maxHeight: window.innerHeight * 0.7, overflow: 'auto' }}>
        <Box py={2}>
          {polygons.length > 0 ? (
            <FormProvider {...formState}>
              <form onSubmit={handleSubmitForms}>
                {polygons.map((polygon, i) => {
                  return (
                    <Box key={polygon.id}>
                      <Tooltip title={polygon.isInvisible ? 'Afficher le polygone' : 'Cacher le polygone'}>
                        <IconButton
                          aria-label='toggle polygon visibility'
                          edge='end'
                          style={{ marginTop: '15px', marginRight: '0' }}
                          onClick={() => togglePolygonVisibility(polygon.id)}
                        >
                          {polygon.isInvisible ? <VisibilityIcon /> : <VisibilityOffIcon />}
                        </IconButton>
                      </Tooltip>
                      <SelectInput
                        name={`${i}.labelType`}
                        source={'labelType'}
                        label='Type de label'
                        choices={labels}
                        alwaysOn
                        resettable
                        sx={{ width: '70%' }}
                      />
                      <Tooltip title='supprimer le polygone'>
                        <IconButton aria-label='delete polygon' edge='end' style={{ marginTop: '15px' }} onClick={() => removeAnnotation(polygon.id)}>
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>

                      <Accordion style={{ marginTop: '-15px', marginBottom: '20px' }} expanded={expanded === i} onChange={handleClickAccordion(i)}>
                        <AccordionSummary expandIcon={<ExpandMore />}>
                          <TextInput
                            name={`${i}.labelName`}
                            source={'labelName'}
                            label={'Nom du label'}
                            defaultValue={`Polygone ${Alphabet[i]}`}
                            helperText={false}
                          />
                        </AccordionSummary>
                        <AccordionDetails>
                          <AnnotatorForm index={i} surface={polygon.surface} />
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
      <Stack sx={{ position: 'absolute', bottom: 30, width: '100%' }} spacing={2}>
        <BPButton
          type='submit'
          data-testid='submit-annotator-form'
          onClick={handleSubmitForms}
          isLoading={isLoading}
          label='resources.annotator.save'
          style={{ width: '100%' }}
        />
        <BPConstruction />
      </Stack>
    </>
  );
};

export default SideBar;
