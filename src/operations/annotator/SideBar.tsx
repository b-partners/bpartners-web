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
  DialogTitle,
  DialogContent
} from '@mui/material';
import { ExpandMore, Inbox as InboxIcon } from '@mui/icons-material';
import { SelectInput } from 'react-admin';
import { FormProvider, useForm } from 'react-hook-form';
import AnnotatorForm from './components/AnnotatorForm';
import { useCanvasAnnotationContext } from 'src/common/store/annotator/Canvas-annotation-store';
import { annotatorMapper } from 'src/providers/mappers';
import { labels } from 'src/__tests__/mocks/responses/annotator-api';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { Polygon } from '@bpartners/annotator-component';
import CalculInfo from '../../assets/pentes/calcul.png';

const SideBar = () => {
  const { polygons, setPolygons, slopeInfoOpen, handleSlopeInfoToggle } = useCanvasAnnotationContext();

  const defaultValues = polygons?.map(() => {
    return {
      label: '',
      revetement: '',
      slope: '',
      usury: '',
      velux: '',
      veluxform: '',
      obstacle: '',
      comment: '',
    };
  });
  const formState = useForm({ defaultValues });

  const handleSubmitForms = formState.handleSubmit(data => {

    const dataMapped = annotatorMapper(data, polygons);
    console.log('dataMapped', dataMapped);
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
                      <SelectInput name={`${i}.label`} source={'label'} choices={labels} alwaysOn resettable sx={{ width: '85%' }} />

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
                          <AnnotatorForm index={i} />
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
