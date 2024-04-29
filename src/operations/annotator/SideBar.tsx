import { Polygon } from '@bpartners/annotator-component';
import { ZoomLevel } from '@bpartners/typescript-client';
import { Delete as DeleteIcon, ExpandMore, Inbox as InboxIcon } from '@mui/icons-material';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Dialog,
  DialogContent,
  Divider,
  IconButton,
  List,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { SelectInput, useRedirect } from 'react-admin';
import { FormProvider, useForm } from 'react-hook-form';
import { useCanvasAnnotationContext } from 'src/common/store/annotator/Canvas-annotation-store';
import { getUrlParams } from 'src/common/utils';
import { Alphabet } from 'src/constants/alphabet';
import { annotatorProvider } from 'src/providers/annotator-provider';
import { annotationsAttributeMapper, annotatorMapper } from 'src/providers/mappers';
import { labels } from 'src/__tests__/mocks/responses/annotator-api';
import { v4 as uuidV4 } from 'uuid';
import CalculInfo from '../../assets/pentes/calcul.png';
import AnnotatorForm from './components/AnnotatorForm';

const SideBar = () => {
  const redirect = useRedirect();
  const { polygons, setPolygons, slopeInfoOpen, handleSlopeInfoToggle } = useCanvasAnnotationContext();
  const annotationId = uuidV4();
  const pictureId = getUrlParams(window.location.search, 'pictureId');
  const imgUrl = getUrlParams(window.location.search, 'imgUrl');

  const defaultValues = polygons?.map(() => {
    return {
      labelType: '',
      covering: '',
      slope: 0,
      wearLevel: 0,
      obstacle: '',
      comment: '',
    };
  });
  const formState = useForm({ defaultValues });

  const handleSubmitForms = formState.handleSubmit(async data => {
    const annotationAttributeMapped = annotationsAttributeMapper(data, polygons, pictureId, annotationId);
    const requestBody = annotatorMapper(annotationAttributeMapped, pictureId, annotationId);

    await annotatorProvider.annotatePicture(pictureId, annotationId, requestBody);
    redirect('list', `invoices?imgUrl=${encodeURIComponent(imgUrl)}&zoomLevel=${ZoomLevel.WORLD_0}&pictureId=${pictureId}&annotationId=${annotationId}`);
  });

  const removeAnnotation = (polygonId: string) => {
    setPolygons((prev: Polygon[]) => prev.filter((polygon: Polygon) => polygon.id !== polygonId));
  };

  return (
    <List sx={{ maxHeight: window.innerHeight * 0.75, overflow: 'auto' }}>
      <Box py={2}>
        {polygons.length > 0 ? (
          <FormProvider {...formState}>
            <form onSubmit={handleSubmitForms}>
              {polygons.map((polygon, i) => {
                return (
                  <Box key={polygon.id}>
                    <SelectInput name={`${i}.labelType`} source={'labelType'} choices={labels} alwaysOn resettable sx={{ width: '85%' }} />

                    <Tooltip title='Supprimer'>
                      <IconButton edge='end' style={{ marginTop: '15px' }} onClick={() => removeAnnotation(polygon.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>

                    <Accordion style={{ marginTop: '-15px', marginBottom: '20px' }}>
                      <AccordionSummary expandIcon={<ExpandMore />}>
                        <Typography>Polygone {Alphabet[i]}</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <AnnotatorForm index={i} surface={polygon.surface} />
                      </AccordionDetails>
                    </Accordion>
                    {/* )} */}
                    <Divider />
                  </Box>
                );
              })}

              <Stack spacing={1} m={2} mb={1} style={{ position: 'fixed', bottom: '55px', width: '250px' }}>
                <Button
                  type='submit'
                  data-testid={`generate-quote`}
                // disabled={isLoading}
                //  startIcon={isLoading && <CircularProgress color='inherit' size={18} />}
                >
                  Générer un devis
                </Button>
              </Stack>
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
            <img src={CalculInfo} alt='Diagramme illustrant le calcul de la pente du toit' width={'100%'} />
          </DialogContent>
        </Dialog>
      )}
    </List>
  );
};

export default SideBar;
