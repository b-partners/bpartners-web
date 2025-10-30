import { BPLoader } from '@/common/components';
import { useLoadingHandler } from '@/common/hooks';
import { parseUrlParams } from '@/common/utils';
import { stringifyObj } from '@/common/utils/stringify';
import { clearPolygons, getCached } from '@/providers';
import { draftAreaPictureAnnotatorProvider } from '@/providers/draft-area-annotations-provider';
import { Polygon } from '@bpartners/annotator-component';
import { AreaPictureAnnotation } from '@bpartners/typescript-client';
import { Grid, Stack } from '@mui/material';
import { FC, useEffect, useMemo, useState } from 'react';
import { FormProvider } from 'react-hook-form';
import { useRetrievePolygons } from '../invoice/utils/use-retrieve-polygons';
import { AnnotatorComponent } from './AnnotatorComponent';
import { SideBar } from './SideBar';
import { AnnotationInfo } from './types';
import { useAnnotationInfosForm } from './utils';
import { mapAreaAnnotationInstanceToAnnotationInfo } from './utils/annotation-info-mapper';

type AnnotatorWithDefaultCacheManagerProps = { defaultPolygons?: Polygon[]; defaultAnnotationInfos?: AnnotationInfo[]; draftAnnotationId?: string };
interface AnnotatorWithDefaultCacheManagerState {
  polygons: Polygon[];
  annotationInfos: AnnotationInfo[];
}

const AnnotatorWithDefaultCacheManager: FC<AnnotatorWithDefaultCacheManagerProps> = props => {
  const { analyseRoof } = parseUrlParams();

  const { draftAnnotationId, defaultAnnotationInfos = [], defaultPolygons = [] } = props;
  const { isLoading, stopLoading } = useLoadingHandler(true);
  const defaultState = { polygons: defaultPolygons, annotationInfos: defaultAnnotationInfos };

  const [defaultAnnotations, setDefaultAnnotations] = useState<AnnotatorWithDefaultCacheManagerState>(defaultState);
  const annotatorFormState = useAnnotationInfosForm(defaultAnnotations.polygons, defaultAnnotations.annotationInfos);

  const shouldAnalyseRoof = analyseRoof === 'true';

  useEffect(() => {
    const cachedDefaultAnnotationInfo = getCached.annotationsInfoList();
    const cachedDefaultPolygons = getCached.polygons() || [];

    if (cachedDefaultAnnotationInfo.length > 0 && cachedDefaultPolygons.length > 0 && !shouldAnalyseRoof)
      setDefaultAnnotations({ polygons: cachedDefaultPolygons, annotationInfos: cachedDefaultAnnotationInfo });
    else clearPolygons();

    stopLoading();
  }, [shouldAnalyseRoof]);

  if (isLoading) {
    return <BPLoader message="Chargement des données d'annotation..." />;
  }

  return (
    <FormProvider {...annotatorFormState}>
      <Grid container height='100%' pl={1}>
        <Grid item xs={!shouldAnalyseRoof ? 8.6 : 12} display='flex' position='relative' justifyContent='center' alignItems='start' mr='1%'>
          <AnnotatorComponent draftAnnotationId={draftAnnotationId} showAddress key={`${analyseRoof}-analyseRoof`} />
        </Grid>
        {!shouldAnalyseRoof && (
          <Grid sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }} flexShrink={0} item xs={3.2}>
            <Stack flexGrow={2} maxHeight={'calc(100vh - 60px)'} position='relative'>
              <SideBar draftAnnotationId={draftAnnotationId} />
            </Stack>
          </Grid>
        )}
      </Grid>
    </FormProvider>
  );
};

const areaPictureFetcher = async (areaPictureId: string) =>
  draftAreaPictureAnnotatorProvider.getList(1, 1, { areaPictureId }) satisfies Promise<AreaPictureAnnotation[]>;

const AnnotatorWithDraftAnnotation = () => {
  const { isAnnotationEmpty, polygons: draftsPolygons, annotations = {} } = useRetrievePolygons(areaPictureFetcher);
  const { annotations: annotationInstances = [] } = annotations;

  const draftAnnotationInfo = useMemo(
    () => annotationInstances.map(mapAreaAnnotationInstanceToAnnotationInfo),
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

export const Annotator = () => {
  const { useDrafts } = parseUrlParams();
  return useDrafts === 'true' ? <AnnotatorWithDraftAnnotation /> : <AnnotatorWithDefaultCacheManager />;
};

export default Annotator;
