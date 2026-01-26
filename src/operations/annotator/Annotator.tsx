import { BPLoader } from '@/common/components';
import { useLoadingHandler } from '@/common/hooks';
import { annotatorStore, useAnnotatorScreenSwitch } from '@/common/store';
import { parseUrlParams } from '@/common/utils';
import { areaPictureAnnotationToPolygonAndAreaPictureInfo, clearPolygons, getCached } from '@/providers';
import { draftAreaPictureAnnotatorProvider } from '@/providers/draft-area-annotations-provider';
import { AreaPictureAnnotation } from '@bpartners/typescript-client';
import { Grid, Stack } from '@mui/material';
import { useEffect } from 'react';
import { FormProvider } from 'react-hook-form';
import { useRetrievePolygons } from '../invoice/utils/use-retrieve-polygons';
import { AnnotatorComponent } from './AnnotatorComponent';
import { Annotator3DInfos } from './components';
import { SideBar } from './SideBar';
import { useAnnotationInfosForm } from './utils';

const AnnotatorWithDefaultCacheManager = () => {
  const { analyseRoof } = parseUrlParams();
  const replaceAnnotations = annotatorStore.useAnnotatorStore(params => params.replaceAnnotations);

  const { isLoading, stopLoading } = useLoadingHandler(true);

  const annotatorFormState = useAnnotationInfosForm();

  const shouldAnalyseRoof = analyseRoof === 'true';

  useEffect(() => {
    const cachedDefaultAnnotationInfo = getCached.annotationsInfoList();
    const cachedDefaultPolygons = getCached.polygons() || [];

    if (cachedDefaultAnnotationInfo.length > 0 && cachedDefaultPolygons.length > 0 && !shouldAnalyseRoof)
      replaceAnnotations(cachedDefaultPolygons, cachedDefaultAnnotationInfo);
    else clearPolygons();

    stopLoading();
  }, [shouldAnalyseRoof]);

  const { screen } = useAnnotatorScreenSwitch();

  if (isLoading) {
    return <BPLoader message="Chargement des données d'annotation..." />;
  }

  return (
    <FormProvider {...annotatorFormState}>
      <Grid container height='100%' pl={1}>
        <Grid item xs={!shouldAnalyseRoof ? 8.6 : 12} display='flex' position='relative' justifyContent='center' alignItems='start' mr='1%'>
          <AnnotatorComponent showAddress key={`${analyseRoof}-analyseRoof`} />
        </Grid>
        {!shouldAnalyseRoof && (
          <Grid sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }} flexShrink={0} item xs={3.2}>
            <Stack flexGrow={2} maxHeight={'calc(100vh - 60px)'} position='relative'>
              {screen !== '3d-annotator' && <SideBar />}
              {screen === '3d-annotator' && <Annotator3DInfos />}
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
  const { isAnnotationEmpty, areaPictureAnnotation } = useRetrievePolygons(areaPictureFetcher);
  const replaceAnnotations = annotatorStore.useAnnotatorStore(params => params.replaceAnnotations);

  useEffect(() => {
    if (areaPictureAnnotation?.annotations) {
      const { annotationsInfos, polygons } = areaPictureAnnotationToPolygonAndAreaPictureInfo(areaPictureAnnotation);
      replaceAnnotations(polygons, annotationsInfos);
    }
  }, [areaPictureAnnotation]);

  if (isAnnotationEmpty) {
    return <BPLoader message="Chargement des brouillons d'annotation..." />;
  }

  return <AnnotatorWithDefaultCacheManager />;
};

export const Annotator = () => {
  const { useDrafts } = parseUrlParams();
  return useDrafts === 'true' ? <AnnotatorWithDraftAnnotation /> : <AnnotatorWithDefaultCacheManager />;
};

export default Annotator;
