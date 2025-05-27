import { BPLoader } from '@/common/components';
import { useLoadingHandler, useWindowResize } from '@/common/hooks';
import { CanvasAnnotationContextProvider } from '@/common/store';
import { parseUrlParams } from '@/common/utils';
import { stringifyObj } from '@/common/utils/stringify';
import { clearPolygons, getCached } from '@/providers';
import { draftAreaPictureAnnotatorProvider } from '@/providers/draft-area-annotations-provider';
import { Polygon } from '@bpartners/annotator-component';
import { AreaPictureAnnotation } from '@bpartners/typescript-client';
import { Grid, Stack } from '@mui/material';
import { FC, useEffect, useMemo, useState } from 'react';
import { useRetrievePolygons } from '../invoice/utils/use-retrieve-polygons';
import { AnnotatorComponent } from './AnnotatorComponent';
import { SideBar } from './SideBar';
import { AnnotationInfo } from './types';
import { mapAreaAnnotationInstanceToAnnotationInfo } from './utils/annotation-info-mapper';

export const Annotator = () => {
  const { useDrafts } = parseUrlParams();
  return useDrafts === 'true' ? <AnnotatorWithDraftAnnotation /> : <AnnotatorWithDefaultCacheManager />;
};

type AnnotatorWithDefaultCacheManagerProps = { defaultPolygons?: Polygon[]; defaultAnnotationInfos?: AnnotationInfo[]; draftAnnotationId?: string };
const AnnotatorWithDefaultCacheManager: FC<AnnotatorWithDefaultCacheManagerProps> = ({
  draftAnnotationId,
  defaultAnnotationInfos = [],
  defaultPolygons = [],
}) => {
  const { width, height } = useWindowResize();
  const { isLoading, stopLoading } = useLoadingHandler(true);
  const [defaultAnnotations, setDefaultAnnotations] = useState<{ polygons: Polygon[]; annotationInfos: AnnotationInfo[] }>({
    polygons: defaultPolygons,
    annotationInfos: defaultAnnotationInfos,
  });

  useEffect(() => {
    const cachedDefaultAnnotationInfo = getCached.annotationsInfoList();
    const cachedDefaultPolygons = getCached.polygons() || [];
    if (cachedDefaultAnnotationInfo.length > 0 && cachedDefaultPolygons.length > 0) {
      setDefaultAnnotations({
        polygons: cachedDefaultPolygons,
        annotationInfos: cachedDefaultAnnotationInfo,
      });
    } else {
      clearPolygons();
    }
    stopLoading();
  }, []);

  if (isLoading) {
    return <BPLoader message="Chargement des données d'annotation..." />;
  }

  return (
    <CanvasAnnotationContextProvider defaultPolygons={defaultAnnotations.polygons}>
      <Grid container height='100%' pl={1}>
        <Grid item xs={8.6} display='flex' justifyContent='center' alignItems='start' mr={'1%'}>
          <AnnotatorComponent showAddress width={width * 0.5} height={height * 0.7} />
        </Grid>
        <Grid sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }} flexShrink={0} item xs={3.2}>
          <Stack flexGrow={2} maxHeight={'calc(100vh - 60px)'} position='relative'>
            <SideBar defaultAnnotationInfos={defaultAnnotations.annotationInfos} draftAnnotationId={draftAnnotationId} />
          </Stack>
        </Grid>
      </Grid>
    </CanvasAnnotationContextProvider>
  );
};

const AnnotatorWithDraftAnnotation = () => {
  const {
    isAnnotationEmpty,
    polygons: draftsPolygons,
    annotations = {},
  } = useRetrievePolygons(async areaPictureId => {
    return draftAreaPictureAnnotatorProvider.getList(1, 1, { areaPictureId }) satisfies Promise<AreaPictureAnnotation[]>;
  });
  const { annotations: annotationInstances = [] } = annotations;
  const draftAnnotationInfo = useMemo(
    () => annotationInstances.map(annotationInstance => mapAreaAnnotationInstanceToAnnotationInfo(annotationInstance)),
    [annotations?.id, stringifyObj(draftsPolygons)]
  );

  if (isAnnotationEmpty) {
    return <BPLoader message="Chargement des brouillons d'annotation..." />;
  }

  return (
    <AnnotatorWithDefaultCacheManager
      draftAnnotationId={annotations.id}
      defaultPolygons={draftsPolygons as Polygon[]}
      defaultAnnotationInfos={draftAnnotationInfo}
    />
  );
};

export default Annotator;
