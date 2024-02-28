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
 } from '@mui/material';
 import { ExpandMore, Inbox as InboxIcon } from '@mui/icons-material';
import { SelectInput } from 'react-admin';
import { FormProvider, useForm } from 'react-hook-form';
import AnnotatorForm from './components/AnnotatorForm';
import {annotatorMapper} from 'src/providers/mappers';
import { useCanvasAnnotationContext } from 'src/common/store/annotator/Canvas-annotation-store';
import { labels } from 'src/__tests__/mocks/responses/annotator-api';

interface Label {
    id: string;
    name: string;
}

interface Annotation {
    polygon: number;
    surface: number;
    labels: Label[];
}

const SideBar = () => {
    const {polygons} = useCanvasAnnotationContext();

    // const annotations : Annotation[] = [
    //     {polygon: 1, surface: 140, labels: [
    //         {id: 'roofId', name: 'Toit'},
    //         {id: 'porteId', name: 'porte'},
    //         {id: 'brefId', name: 'bref'}
    //     ]},
    //     {polygon: 2, surface: 95, labels: [
    //         {id: 'roofId', name: 'Toit'},
    //         {id: 'veluxId', name: 'velux'},
    //         {id: 'compteId', name: 'compe'}
    //     ]}
    // ]        
    
    const defaultValues = polygons?.map(() => {
        return {
            revetement:'',
            pente: '',
            usury: '',
            velux: '',
            veluxform: '',
            obstacle: '',
            comment: '',
         };
    });
    const formState = useForm({defaultValues});

    // const { formValues, updateFormValues } = useCanvasAnnotationContext();

    const handleSubmitForms = formState.handleSubmit(data =>{
        
        const dataMapped = annotatorMapper(data);
        console.log('dataMapped', dataMapped);
        // const parsedLabel = JSON.parse(selectedLabel);
        // console.log("parsedLabel", parsedLabel);
        
        
    })
    
    return (
        <List
            sx={{ maxHeight: window.innerHeight * 0.75, overflow: 'auto' }}
            // subheader={<ListSubheader>Labels</ListSubheader>}
        >
            <Box py={2}>
                {/* {isAdmin() &&
                    annotations.map(annotation => <AdminAnnotationItem key={annotation.id} annotation={annotation} />)} */}
                {/* {isUser() && */}
                {
                    polygons.length > 0 ?
                <FormProvider {...formState}>
                    <form onSubmit={handleSubmitForms}>
                    {polygons.map((polygon, i) => {
                         return ( 
                        
                            <Box> {/* key={annotation.id} */}
                             <SelectInput name={`${i}.label`} source={'label'} choices={labels} alwaysOn resettable sx={{width:'90%'}}/>
                                    <Accordion style={{ marginTop: '-15px', marginBottom: '20px'}}>
                                            <AccordionSummary expandIcon={<ExpandMore />}>
                                              <Typography>Polygone {i + 1}</Typography>
                                            </AccordionSummary>
                                            <AccordionDetails>  
                                              <AnnotatorForm index={i}/>                                                                      
                                            </AccordionDetails>
                                    </Accordion>
                                {/* )} */}
                                <Divider />
                            </Box>
                         );
                    })} 
                   
                        <Stack spacing={1} m={2} mb={1}  style={{position: 'fixed', bottom: '55px', width: '250px'}}>
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
        </List>
    );
};

export default SideBar;