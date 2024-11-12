import { BPLoader } from '@/common/components';
import { useWindowResize } from '@/common/hooks';
import { CanvasAnnotationContextProvider } from '@/common/store';
import { parseUrlParams } from '@/common/utils';
import { cache, clearPolygons, getCached } from '@/providers';
import { draftAreaPictureAnnotatorProvider } from '@/providers/draft-area-annotations-provider';
import { Polygon } from '@bpartners/annotator-component';
import { AreaPictureAnnotation } from '@bpartners/typescript-client';
import { Grid, Stack } from '@mui/material';
import { FC, useEffect, useMemo, useState } from 'react';
import { useRetrievePolygons } from '../invoice/utils/use-retrieve-polygons';
import { SideBar } from './SideBar';
import { AnnotationItem } from './types';
import { AnnotatorComponent } from './AnnotatorComponent';
import { mapAreaAnnotationInstanceToAnnotationInfo } from './utils/annotation-info-mapper';
import { useAnnotationItemsForm } from './utils/annotations-item-form';
import { mapPolygonsToAnnotationItems } from './utils/annotation-item-mapper';
import { stringifyObj } from '@/common/utils/stringify';

export const Annotator = () => {
  const { useDrafts } = parseUrlParams();
  return useDrafts === 'true' ? <AnnotatorWithDraftAnnotation /> : <AnnotatorWithDefaultCacheManager />;
};

type AnnotatorUIProps = { defaultAnnotationItems?: AnnotationItem[], draftAnnotationId?: string };
const AnnotatorUI: FC<AnnotatorUIProps> = ({ draftAnnotationId, defaultAnnotationItems = [] }) => {
  const { width, height } = useWindowResize();
  const {
    formState,
    fieldArrayState,
    setPolygons,
    removeAnnotationByPolygonId
  } = useAnnotationItemsForm(defaultAnnotationItems);
  const polygons = fieldArrayState.fields.map(annotation => annotation.polygon);

  useEffect(() => {
    const subscription = formState.watch((values) => {
      const polygons = values.annotations?.map(annotation => annotation.polygon);
      const annotationInfos = values.annotations?.map(annotation => annotation.annotationInfo);
      cache.annotationsInfo(annotationInfos);
      cache.polygons(polygons as Polygon[]);
    });

    return () => {
      subscription.unsubscribe();
    }
  }, []);

  return (
    <CanvasAnnotationContextProvider removeAnnotationByPolygonId={removeAnnotationByPolygonId} setPolygons={setPolygons} polygons={polygons}>
      <Grid container height='94%' pl={1}>
        <Grid item xs={8.6} display='flex' justifyContent='center' alignItems='start' mr={'1%'}>
          <AnnotatorComponent width={width * 0.6} height={height * 0.7} />
        </Grid>
        <Grid sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }} flexShrink={0} item xs={3.2}>
          <Stack flexGrow={2} position='relative'>
            <SideBar fieldArrayState={fieldArrayState} formState={formState} draftAnnotationId={draftAnnotationId} />
          </Stack>
        </Grid>
      </Grid>
    </CanvasAnnotationContextProvider>
  )
}

const AnnotatorWithDefaultCacheManager: FC<AnnotatorUIProps> = ({
  draftAnnotationId,
  defaultAnnotationItems = []
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [defaultAnnotations, setDefaultAnnotations] = useState<AnnotationItem[]>(defaultAnnotationItems);

  useEffect(() => {
    const cachedDefaultAnnotationInfo = getCached.annotationsInfoList();
    const cachedDefaultPolygons = getCached.polygons() || [];
    if (cachedDefaultAnnotationInfo.length > 0 && cachedDefaultPolygons.length > 0) {
      const cachedDefaultValues = mapPolygonsToAnnotationItems(cachedDefaultPolygons, cachedDefaultAnnotationInfo);
      setDefaultAnnotations(cachedDefaultValues);
    } else {
      clearPolygons();
    }
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return <BPLoader message="Chargement des données d'annotation..." />;
  }

  return <AnnotatorUI defaultAnnotationItems={defaultAnnotations} draftAnnotationId={draftAnnotationId} />
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
  const draftAnnotationItems = mapPolygonsToAnnotationItems(draftsPolygons as Polygon[], draftAnnotationInfo);

  if (isAnnotationEmpty) {
    return <BPLoader message="Chargement des brouillons d'annotation..." />;
  }

  return <AnnotatorWithDefaultCacheManager draftAnnotationId={annotations.id} defaultAnnotationItems={draftAnnotationItems} />;
};
export default Annotator;
