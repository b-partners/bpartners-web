import { Grid, Stack } from '@mui/material';
import { CanvasAnnotationContextProvider } from 'src/common/store/annotator/Canvas-annotation-store';
import AnnotatorComponent from './AnnotatorComponent';
import SideBar from './SideBar';

const Annotator = () => {
  return (
    <CanvasAnnotationContextProvider>
      <Grid container height='94%' pl={1}>
        <Grid item xs={8.6} display='flex' justifyContent='center' alignItems='center' mr={'1%'}>
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
