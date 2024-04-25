import {
  Box,
  Button,
  Divider,
  List,
  Typography,
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Stack,
  IconButton,
  Tooltip,
  Dialog,
  DialogContent
} from '@mui/material';
import { v4 as uuidV4 } from 'uuid';
import { ExpandMore, Inbox as InboxIcon } from '@mui/icons-material';
import { SelectInput } from 'react-admin';
import { FormProvider, useForm } from 'react-hook-form';
import AnnotatorForm from './components/AnnotatorForm';
import { useCanvasAnnotationContext } from 'src/common/store/annotator/Canvas-annotation-store';
import { annotationsAttributeMapper, annotatorMapper } from 'src/providers/mappers';
import { labels } from 'src/__tests__/mocks/responses/annotator-api';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { Polygon } from '@bpartners/annotator-component';
import CalculInfo from '../../assets/pentes/calcul.png';
import { getUrlParams } from 'src/common/utils';
import { annotatorProvider } from 'src/providers/annotator-provider';

const SideBar = () => {
  const { polygons, setPolygons, slopeInfoOpen, handleSlopeInfoToggle } = useCanvasAnnotationContext();
  const annotationId = uuidV4();
  const pictureId = getUrlParams(window.location.search, 'pictureId');

  const defaultValues = polygons?.map(() => {
    return {
      labelType: '',
      covering: '',
      slope: 0,
      wearLevel: 0,
      velux: 0,
      veluxform: '',
      obstacle: '',
      comment: '',
    };
  });
  const formState = useForm({ defaultValues });

  const handleSubmitForms = formState.handleSubmit(async data => {

    const annotationAttributeMapped = annotationsAttributeMapper(data, polygons, pictureId, annotationId);
    const requestBody = annotatorMapper(annotationAttributeMapped, pictureId, annotationId);
    console.log("annotationAttributeMapped", annotationAttributeMapped);

    console.log("requestBody", requestBody);
    await annotatorProvider.annotatePicture(pictureId, annotationId, requestBody);

  });

  const removeAnnotation = (polygonId: string) => {
    setPolygons((prev: Polygon[]) => prev.filter((polygon: Polygon) => polygon.id !== polygonId));
  }

  return (
    <List sx={{ maxHeight: window.innerHeight * 0.75, overflow: 'auto' }}>
      <Box py={2}>
        {
          polygons.length > 0 ?
            <FormProvider {...formState}>
              <form onSubmit={handleSubmitForms}>
                {polygons.map((polygon, i) => {
                  return (

                    <Box key={polygon.id}>
                      <SelectInput name={`${i}.labelType`} source={'labelType'} choices={labels} alwaysOn resettable sx={{ width: '85%' }} />

                      <Tooltip title="Supprimer">
                        <IconButton edge='end' style={{ marginTop: '15px' }} onClick={() => removeAnnotation(polygon.id)}>
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>

                      <Accordion style={{ marginTop: '-15px', marginBottom: '20px' }}>
                        <AccordionSummary expandIcon={<ExpandMore />}>
                          <Typography>Polygone {i + 1}</Typography>
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
            :
            <Box display='flex' color='#00000050' marginTop='2rem' width='100%' alignItems='center' flexDirection='column'>
              <div>
                <InboxIcon sx={{ fontSize: '6rem' }} />
              </div>
              <Typography width={200} textAlign='center'>
                Aucune annotation n'a encore été effectuée.
              </Typography>
            </Box>
        }
      </Box>
      {
        slopeInfoOpen &&
        <Dialog open={slopeInfoOpen} onClose={handleSlopeInfoToggle}>
          <DialogContent>
            <img src={CalculInfo} alt="Diagramme illustrant le calcul de la pente du toit" width={"100%"} />
          </DialogContent>
        </Dialog>
      }
    </List>
  );
};

export default SideBar;
