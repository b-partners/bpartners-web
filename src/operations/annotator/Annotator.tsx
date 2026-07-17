import { BPLoader, GlobaDialog } from '@/common/components';
import { useRoofPolygonFetcher, useSaveAnnotations } from '@/common/fetcher';
import { useCacheImage, useHeartBeat } from '@/common/hooks';
import { annotatorStore, useAnnotatorComponentStore } from '@/common/store';
import { copyObject, downloadAndCacheImage, getFileUrl, getImageFromCache, parseUrlParams } from '@/common/utils';
import { getAnalyseImageFileId } from '@/constants';
import { areaPictureAnnotationToPolygonAndAreaPictureInfo, fileProvider } from '@/providers';
import { AreaPictureDetails, FileType } from '@bpartners/typescript-client';
import { ArrowBack, Replay, Save } from '@mui/icons-material';
import { AppBar, Button, Divider, IconButton, ListItemText, Skeleton, Stack, Toolbar, Tooltip, Typography } from '@mui/material';
import { useEffect, useRef } from 'react';
import { useGetOne } from 'react-admin';
import { FormProvider } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { useShallow } from 'zustand/react/shallow';
import { useRetrievePolygons } from '../invoice/utils/use-retrieve-polygons';
import { AnnotatorComponent } from './AnnotatorComponent';
import {
  AnnotationHelpButton,
  AnnotatorExportPdfButton,
  DegradationLevelsStack,
  RoofAnalyseRegenerateButton,
  SaveStatus,
  ScreenSwitchTabs,
} from './components';
import { Annotator3DRegenerateButton } from './components/3d-renderer/annotator-3d-regenerate-button';
import { SideBar } from './SideBar';
import { annotatorAppBarStyle, annotatorBottomToolbarStyle, annotatorDisclaimerStyle } from './style';
import { calculateGlobalRate, useAnnotationInfosForm, useRoofAnalyseGeneration } from './utils';

export const Annotator = () => {
  useHeartBeat();
  const { projectId } = useParams();
  const { setAreaPictureDetails, setAnalyseImageUrl, setAnalyseImageFileId } = useAnnotatorComponentStore();
  const { data: annotations, isLoading } = useGetOne(
    'drafts-annotations',
    { id: projectId },
    {
      onSuccess: data => setAreaPictureDetails(data.areaPicture),
    }
  );
  const { isCaching: isCachingImage, cacheImage } = useCacheImage();

  const fileId = annotations?.areaPicture?.fileId;
  const analyseImageGenerated = annotations?.properties?.analyseImageGenerated;

  const { geocode, setGeocodeStatus } = annotatorStore.useGeocodeStore();
  const { mutate: mutateRoofPolygon } = useRoofPolygonFetcher();

  useEffect(() => {
    if (!fileId) return;
    cacheImage(fileId, 'AREA_PICTURE');
  }, [fileId, cacheImage]);

  useEffect(() => {
    if (!fileId || !analyseImageGenerated) return;
    const analyseImageFileId = getAnalyseImageFileId(fileId);
    downloadAndCacheImage(analyseImageFileId, getFileUrl(analyseImageFileId, FileType.AREA_PICTURE)).then(async url => {
      setAnalyseImageUrl(url);
      const blob = await getImageFromCache(analyseImageFileId);
      if (blob) {
        const fileAsArrayBuffer = await blob.arrayBuffer();
        await fileProvider.update([{ fileId: analyseImageFileId, fileType: FileType.AREA_PICTURE, fileMimeType: blob.type || 'image/png', fileAsArrayBuffer }]);
      }
      setAnalyseImageFileId(analyseImageFileId);
    });
  }, [fileId, analyseImageGenerated, setAnalyseImageUrl, setAnalyseImageFileId]);
  const { isAnnotationEmpty, areaPictureAnnotation } = useRetrievePolygons(annotations);
  const replaceAnnotations = annotatorStore.useAnnotatorStore(useShallow(params => params.replaceAnnotations));

  useEffect(() => {
    if (areaPictureAnnotation?.annotations) {
      const { annotationsInfos, polygons } = areaPictureAnnotationToPolygonAndAreaPictureInfo(areaPictureAnnotation);
      replaceAnnotations(polygons, annotationsInfos);
    }
    if (geocode && areaPictureAnnotation?.annotations.length === 0) {
      setGeocodeStatus('pending');
      mutateRoofPolygon(
        { areaPictureDetails: annotations?.areaPicture, geoJson: geocode.data, isForOriginImage: true },
        { onSettled: () => setGeocodeStatus('done') }
      );
    } else {
      setGeocodeStatus('no-annotation');
    }
  }, [areaPictureAnnotation, geocode]);

  const navigate = useNavigate();
  const toolbarRef = useRef<HTMLDivElement>(null);
  const annotatorFormState = useAnnotationInfosForm();

  const { isSaveAnnotationsPending, triggerManualSave, lastSavingDate: lastSavedDate } = useSaveAnnotations();
  const roofAnalyseGeneration = useRoofAnalyseGeneration();

  const lastSavingDate = lastSavedDate ?? (annotations?.properties?.lastSavingDate as string | undefined);

  if (isAnnotationEmpty || !annotations || isLoading || isCachingImage) {
    return <BPLoader message='Chargement des données...' />;
  }

  const { analyseRoof } = parseUrlParams();
  const areaPicture = copyObject<AreaPictureDetails>(annotations.areaPicture);
  const shouldAnalyseRoof = analyseRoof === 'true';
  const address = areaPicture?.address;
  const source = areaPicture?.actualLayer?.name;
  const gpsInfo = ` (GPS ${areaPicture?.geoPositions?.[0]?.latitude}, ${areaPicture?.geoPositions?.[0]?.longitude})`;

  const globalRate = calculateGlobalRate();

  return (
    <FormProvider {...annotatorFormState}>
      <AppBar elevation={2} color='inherit' sx={annotatorAppBarStyle} position='fixed'>
        <Toolbar ref={toolbarRef}>
          <Stack className='toolbar-logo-stack' direction='row' gap={1}>
            <Tooltip title='Retour au tableau de bord' arrow>
              <IconButton className='toolbar-back-btn' onClick={() => navigate('/')} size='small'>
                <ArrowBack fontSize='small' />
              </IconButton>
            </Tooltip>
            <Divider orientation='vertical' flexItem />
            <img src='/logo.png' alt='birdia-logo' className='toolbar-logo' />
            <Divider className='toolbar-divider-left' orientation='vertical' flexItem />
            <ListItemText primary={address || <Skeleton className='toolbar-address-skeleton' />} secondary={`${source} ${gpsInfo}`} />
          </Stack>
          <AnnotationHelpButton />
          <ScreenSwitchTabs onBeforeSwitch={triggerManualSave} />
        </Toolbar>
      </AppBar>
      <Toolbar />
      <Stack direction='row' gap={1} sx={{ pl: 1, mt: 0.5, height: 'calc(100vh - 130px)' }}>
        <AnnotatorComponent showAddress key={`${analyseRoof}-analyseRoof`} />
        {!shouldAnalyseRoof && <SideBar />}
      </Stack>
      <Toolbar sx={annotatorBottomToolbarStyle}>
        <Stack direction='row'>
          <DegradationLevelsStack globalRate={globalRate} />
        </Stack>
        <Stack className='bottom-toolbar-actions' direction='row' gap={1}>
          <SaveStatus isSaving={isSaveAnnotationsPending} lastSavingDate={lastSavingDate} />
          <Annotator3DRegenerateButton
            className='bottom-toolbar-regenerate-btn'
            sx={{ minWidth: 'auto' }}
            variant='outlined'
            size='small'
            color='secondary'
            startIcon={<Replay fontSize='small' />}
          />
          <RoofAnalyseRegenerateButton
            className='bottom-toolbar-roof-analyse-regenerate-btn'
            sx={{ minWidth: 'auto' }}
            variant='outlined'
            size='small'
            color='secondary'
            generation={roofAnalyseGeneration}
          />
          <AnnotatorExportPdfButton className='bottom-toolbar-export-btn' variant='outlined' size='small' color='secondary' areaPictureDetails={areaPicture} />
          <Button
            className='bottom-toolbar-save-btn'
            variant='contained'
            disabled={isSaveAnnotationsPending}
            size='small'
            color='secondary'
            startIcon={<Save fontSize='small' />}
            onClick={triggerManualSave}
          >
            Sauvegarder
          </Button>
        </Stack>
      </Toolbar>
      <Typography sx={annotatorDisclaimerStyle}>Disclaimer : rapport généré par IA statistique nécessitant confirmation par votre expert toiture.</Typography>
      <GlobaDialog />
    </FormProvider>
  );
};

export default Annotator;
