import { BPLoader } from '@/common/components';
import { useWindowResize } from '@/common/hooks';
import { CanvasAnnotationContextProvider, CanvasAnnotationContextProviderProps } from '@/common/store';
import { parseUrlParams } from '@/common/utils';
import { cache, getCached } from '@/providers';
import { draftAreaPictureAnnotatorProvider } from '@/providers/draft-area-annotations-provider';
import { Polygon } from '@bpartners/annotator-component';
import { AreaPictureAnnotation } from '@bpartners/typescript-client';
import { Grid, Stack } from '@mui/material';
import { FC, useEffect, useMemo } from 'react';
import { useRetrievePolygons } from '../invoice/utils/use-retrieve-polygons';
import AnnotatorComponent from './AnnotatorComponent';
import SideBar from './SideBar';

const Annotator = () => {
  const { useDrafts = false } = parseUrlParams();
  return useDrafts ? <AnnotatorWithDraftAnnotation /> : <AnnotatorBaseContent />;
};

const AnnotatorBaseContent: FC<Pick<CanvasAnnotationContextProviderProps, 'defaultPolygons'> & { draftAnnotationId?: string }> = ({
  defaultPolygons,
  draftAnnotationId,
}) => {
  const { width, height } = useWindowResize();
  return (
    <CanvasAnnotationContextProvider defaultPolygons={defaultPolygons}>
      <Grid container height='94%' pl={1}>
        <Grid item xs={8.6} display='flex' justifyContent='center' alignItems='start' mr={'1%'}>
          <AnnotatorComponent width={width * 0.6} height={height * 0.7} />
        </Grid>
        <Grid sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }} flexShrink={0} item xs={3.2}>
          <Stack flexGrow={2} position='relative'>
            <SideBar draftAnnotationId={draftAnnotationId} />
          </Stack>
        </Grid>
      </Grid>
    </CanvasAnnotationContextProvider>
  );
};

const AnnotatorWithDraftAnnotation = () => {
  const {
    polygons: draftsPolygons,
    annotations,
    isLoading,
  } = useRetrievePolygons(async areaPictureId => {
    return draftAreaPictureAnnotatorProvider.getList(1, 1, { areaPictureId }) satisfies Promise<AreaPictureAnnotation[]>;
  });
  const cachedPolygons = useMemo(() => getCached.polygons() || [], [getCached]);
  const defaultPolygons = cachedPolygons.length > 0 ? cachedPolygons : draftsPolygons;

  useEffect(() => {
    if (defaultPolygons.length > 0) {
      cache.polygons(draftsPolygons as Polygon[]);
    }
  }, [annotations.id, defaultPolygons, cache]);

  if (isLoading || defaultPolygons.length === 0) {
    return <BPLoader message="Chargement des brouillons d'annotation" />;
  }

  return <AnnotatorBaseContent draftAnnotationId={annotations.id} defaultPolygons={draftsPolygons as Polygon[]} />;
};
export default Annotator;
