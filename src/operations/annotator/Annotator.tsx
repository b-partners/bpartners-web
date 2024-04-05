import { Grid, Stack } from '@mui/material';
import SideBar from './SideBar';
import { CanvasAnnotationContextProvider } from 'src/common/store/annotator/Canvas-annotation-store';
import AnnotatorComponent from './AnnotatorComponent';

const Annotator = () => {
  const imageAnnotated = [
    {
      id: 'idImg',
      features: [
        {
          id: 'uuId',
          geometry: '',
          attributes: {
            lables: ['roof', 'velux', 'arbre'],
            input1: 'test',
            input2: 'test',
          },
        },
        {
          id: 'uuId2',
          geometry: '',
          attributes: {
            lables: ['roof', 'velux', 'arbre'],
            input1: 'test2',
            input2: 'test2',
          },
        },
        {
          id: 'uuId3',
          geometry: '',
          attributes: {
            lables: ['roof', 'velux', 'arbre'],
            input1: 'test3',
            input2: 'test3',
          },
        },
      ],
    },
  ];

  return (
    <CanvasAnnotationContextProvider>
      <Grid container height='94%' pl={1}>
        <Grid item xs={8.6} display='flex' justifyContent='center' alignItems='center' mr={'1%'}>
          {/* <div>{job && <Canvas isLoading={isLoading} job={job} />}</div> */}
          <AnnotatorComponent />
        </Grid>
        <Grid sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }} item xs={3.2}>
          <Stack flexGrow={2}>
            <SideBar />
          </Stack>
        </Grid>
      </Grid>
    </CanvasAnnotationContextProvider>
  );
};

export default Annotator;
