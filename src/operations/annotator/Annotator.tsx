import { BPLoader } from '@/common/components';
import { annotatorStore, useAnnotatorComponentStore, useAnnotatorScreenSwitch } from '@/common/store';
import { copyObject, downloadAndCacheImage, getFileUrl, parseUrlParams } from '@/common/utils';
import { areaPictureAnnotationToPolygonAndAreaPictureInfo } from '@/providers';
import { AreaPictureDetails } from '@bpartners/typescript-client';
import { ArrowBack, Download, Replay, Save } from '@mui/icons-material';
import { AppBar, Box, Button, Divider, IconButton, ListItemText, Skeleton, Stack, Toolbar, Tooltip, Typography } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { useGetOne } from 'react-admin';
import { FormProvider } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { useShallow } from 'zustand/react/shallow';
import { useRetrievePolygons } from '../invoice/utils/use-retrieve-polygons';
import { degradationLevels } from '../prospects/constants';
import { AnnotatorComponent } from './AnnotatorComponent';
import { ScreenSwitchTabs } from './components';
import { SideBar } from './SideBar';
import { annotatorAppBarStyle, annotatorBottomToolbarStyle, annotatorDisclaimerStyle } from './style';
import { calculateGlobalRate, useAnnotationInfosForm } from './utils';

export const Annotator = () => {
  const { projectId } = useParams();
  const { setAreaPictureDetails } = useAnnotatorComponentStore();
  const { data: areaPictureDetails, isLoading } = useGetOne(
    'drafts-annotations',
    { id: projectId },
    {
      onSuccess: data => setAreaPictureDetails(data.areaPicture),
    }
  );
  const [isCachingImage, setIsCachingImage] = useState(false);

  const fileId = areaPictureDetails?.areaPicture?.fileId;
  const fileUrl = fileId ? getFileUrl(fileId, 'AREA_PICTURE') : null;

  useEffect(() => {
    if (!fileId || !fileUrl) return;
    setIsCachingImage(true);
    downloadAndCacheImage(fileId, fileUrl).finally(() => setIsCachingImage(false));
  }, [fileId, fileUrl]);
  const { isAnnotationEmpty, areaPictureAnnotation } = useRetrievePolygons(areaPictureDetails);
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

  const { screen } = useAnnotatorScreenSwitch();

  if (isAnnotationEmpty || !areaPictureDetails || isLoading || isCachingImage) {
    return <BPLoader message='Chargement des données...' />;
  }

  const { analyseRoof } = parseUrlParams();
  const areaPicture = copyObject<AreaPictureDetails>(areaPictureDetails);
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
          <ScreenSwitchTabs areaPicture={areaPicture} />
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
          {screen === '3d-annotator' && (
            <Button className='bottom-toolbar-regenerate-btn' variant='outlined' size='small' color='secondary' startIcon={<Replay fontSize='small' />}>
              Régénérer la 3D
            </Button>
          )}
          <Button className='bottom-toolbar-export-btn' variant='outlined' size='small' color='secondary' startIcon={<Download fontSize='small' />}>
            Exporter en PDF
          </Button>
          <Button className='bottom-toolbar-save-btn' variant='contained' size='small' color='secondary' startIcon={<Save fontSize='small' />}>
            Sauvegarder
          </Button>
        </Stack>
      </Toolbar>
      <Typography sx={annotatorDisclaimerStyle}>Disclaimer : rapport généré par IA statistique nécessitant confirmation par votre expert toiture.</Typography>
    </FormProvider>
  );
};

export default Annotator;
