import { BPLoader, GlobaDialog } from '@/common/components';
import { useSaveAnnotations } from '@/common/fetcher';
import { useCacheImage } from '@/common/hooks';
import { annotatorStore, useAnnotatorComponentStore } from '@/common/store';
import { copyObject, downloadAndCacheImage, getFileUrl, parseUrlParams } from '@/common/utils';
import { getAnalyseImageFileId } from '@/constants';
import { areaPictureAnnotationToPolygonAndAreaPictureInfo } from '@/providers';
import { AreaPictureDetails, FileType } from '@bpartners/typescript-client';
import { ArrowBack, Download, Replay, Save } from '@mui/icons-material';
import { AppBar, Box, Button, Divider, IconButton, ListItemText, Skeleton, Stack, Toolbar, Tooltip, Typography } from '@mui/material';
import { useEffect, useRef } from 'react';
import { useGetOne } from 'react-admin';
import { FormProvider } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { useShallow } from 'zustand/react/shallow';
import { useRetrievePolygons } from '../invoice/utils/use-retrieve-polygons';
import { degradationLevels } from '../prospects/constants';
import { AnnotatorComponent } from './AnnotatorComponent';
import { SaveStatus, ScreenSwitchTabs } from './components';
import { Annotator3DRegenerateButton } from './components/3d-renderer/annotator-3d-regenerate-button';
import { SideBar } from './SideBar';
import { annotatorAppBarStyle, annotatorBottomToolbarStyle, annotatorDisclaimerStyle } from './style';
import { calculateGlobalRate, useAnnotationInfosForm } from './utils';

export const Annotator = () => {
  const { projectId } = useParams();
  const { setAreaPictureDetails, setAnalyseImageUrl } = useAnnotatorComponentStore();
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

  useEffect(() => {
    if (!fileId) return;
    cacheImage(fileId, 'AREA_PICTURE');
  }, [fileId, cacheImage]);

  useEffect(() => {
    if (!fileId || !analyseImageGenerated) return;
    const analyseImageFileId = getAnalyseImageFileId(fileId);
    downloadAndCacheImage(analyseImageFileId, getFileUrl(analyseImageFileId, FileType.AREA_PICTURE)).then(setAnalyseImageUrl);
  }, [fileId, analyseImageGenerated, setAnalyseImageUrl]);
  const { isAnnotationEmpty, areaPictureAnnotation } = useRetrievePolygons(annotations);
  const replaceAnnotations = annotatorStore.useAnnotatorStore(useShallow(params => params.replaceAnnotations));

  useEffect(() => {
    if (areaPictureAnnotation?.annotations) {
      const { annotationsInfos, polygons } = areaPictureAnnotationToPolygonAndAreaPictureInfo(areaPictureAnnotation);
      replaceAnnotations(polygons, annotationsInfos);
    }
  }, [areaPictureAnnotation]);

  const navigate = useNavigate();
  const toolbarRef = useRef<HTMLDivElement>(null);
  const annotatorFormState = useAnnotationInfosForm();
  const { threeDFromSegmentation, setThreeDFromSegmentation } = annotatorStore.useAnnotatorStore(
    useShallow(({ threeDFromSegmentation, setThreeDFromSegmentation }) => ({ threeDFromSegmentation, setThreeDFromSegmentation }))
  );

  const { isSaveAnnotationsPending, triggerManualSave, lastSavingDate: lastSavedDate } = useSaveAnnotations();

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
          <Button
            className='toolbar-3d-btn'
            size='small'
            variant='outlined'
            color='secondary'
            onClick={() => setThreeDFromSegmentation(!threeDFromSegmentation)}
          >
            3D : {threeDFromSegmentation ? 'Délimiter le toit' : 'Délimiter les pans'}
          </Button>
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
          <Box className='degradation-fieldset'>
            <Typography component='legend' className='degradation-legend'>
              Note de dégradation globale
            </Typography>
            <Stack className='degradation-levels' direction='row' alignItems='center' gap={0.5}>
              {degradationLevels.map(({ color, label, textColor }) =>
                globalRate.type === label ? (
                  <Box key={label} className='degradation-pill-active' sx={{ bgcolor: color, color: textColor }}>
                    <Box className='degradation-pill-letter'>{label}</Box>
                    <Typography className='degradation-pill-value'>{globalRate.value}%</Typography>
                  </Box>
                ) : (
                  <Box key={label} className='degradation-dot' sx={{ bgcolor: color }}>
                    {label}
                  </Box>
                )
              )}
            </Stack>
          </Box>
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
          <Button className='bottom-toolbar-export-btn' variant='outlined' size='small' color='secondary' startIcon={<Download fontSize='small' />}>
            Exporter en PDF
          </Button>
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
