import { useWindowResize } from '@/common/hooks';
import { CanvasAnnotationContextProvider } from '@/common/store';
import { Grid, Stack } from '@mui/material';
import AnnotatorComponent from './AnnotatorComponent';
import SideBar from './SideBar';

const Annotator = () => {
  const { width, height } = useWindowResize();

  return (
    <CanvasAnnotationContextProvider>
      <Grid container height='94%' pl={1}>
        <Grid item xs={8.6} display='flex' justifyContent='center' alignItems='start' mr={'1%'}>
          <AnnotatorComponent width={width * 0.6} height={height * 0.7} />
        </Grid>
        <Grid sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }} flexShrink={0} item xs={3.2}>
          <Stack flexGrow={2} position='relative'>
            <SideBar />
          </Stack>
        </Grid>
      </Grid>
    </CanvasAnnotationContextProvider>
  );
};

export default Annotator;
