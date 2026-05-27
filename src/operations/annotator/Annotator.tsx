import { PALETTE_COLORS } from '@/bp-theme';
import { BPLoader } from '@/common/components';
import { useAreaPictureDetailsFetcher } from '@/common/fetcher';
import { useLoadingHandler } from '@/common/hooks';
import { annotatorStore, useAnnotatorScreenSwitch } from '@/common/store';
import { copyObject, parseUrlParams } from '@/common/utils';
import { ZOOM_LEVEL } from '@/constants/zoom-level';
import { areaPictureAnnotationToPolygonAndAreaPictureInfo, clearPolygons, getCached } from '@/providers';
import { draftAreaPictureAnnotatorProvider } from '@/providers/draft-area-annotations-provider';
import { AreaPictureAnnotation, AreaPictureDetails } from '@bpartners/typescript-client';
import { Download, MoreVert, Save } from '@mui/icons-material';
import {
  AppBar,
  Box,
  Button,
  Divider,
  Grid,
  IconButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Popover,
  Skeleton,
  Stack,
  TextField,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';
import { MouseEvent, useEffect, useRef, useState } from 'react';
import { FormProvider } from 'react-hook-form';
import { useShallow } from 'zustand/react/shallow';
import { useRetrievePolygons } from '../invoice/utils/use-retrieve-polygons';
import { degradationLevels } from '../prospects/constants';
import { AnnotatorComponent } from './AnnotatorComponent';
import { ScreenSwitchTabs } from './components';
import { SideBar } from './SideBar';
import { calculateGlobalRate, useAnnotationInfosForm } from './utils';

const AnnotatorWithDefaultCacheManager = () => {
  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement | null>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const { analyseRoof } = parseUrlParams();
  const replaceAnnotations = annotatorStore.useAnnotatorStore(useShallow(params => params.replaceAnnotations));
  const { currentAreaPictureDetailsToUse, mutateAreaPictureDetails, isLoading: isAreaPictureDetailsLoading } = useAreaPictureDetailsFetcher();

  const areaPicture = copyObject<AreaPictureDetails>(currentAreaPictureDetailsToUse);

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
  const { threeDFromSegmentation, setThreeDFromSegmentation } = annotatorStore.useAnnotatorStore(
    useShallow(({ threeDFromSegmentation, setThreeDFromSegmentation }) => ({ threeDFromSegmentation, setThreeDFromSegmentation }))
  );

  if (isLoading || isAreaPictureDetailsLoading) {
    return <BPLoader message='Chargement des données...' />;
  }

  const address = areaPicture?.address;
  const source = areaPicture?.actualLayer?.name;
  const isExtended = areaPicture?.isExtended;
  const otherLayers = areaPicture?.otherLayers;
  const zoomLevel = areaPicture?.zoom?.level;
  const gpsInfo = ` (GPS ${areaPicture?.geoPositions?.[0]?.latitude}, ${areaPicture?.geoPositions?.[0]?.longitude})`;

  const handleChangeZoomLevel = (zoomLevel: any) => () => mutateAreaPictureDetails({ ...areaPicture, zoomLevel, zoom: { level: zoomLevel } });

  const handleChangeLayer = (layer: any) => () => mutateAreaPictureDetails({ ...areaPicture, zoomLevel, layerId: layer.id });

  const globalRate = calculateGlobalRate();

  return (
    <FormProvider {...annotatorFormState}>
      <AppBar elevation={2} color='inherit' sx={{ border: 'none', margin: 0 }} position='fixed'>
        <Toolbar ref={toolbarRef}>
          <Stack direction='row' gap={1} sx={{ flexGrow: 1 }}>
            <img src='/logo.png' alt='birdia-logo' style={{ objectFit: 'contain', width: '5rem' }} />
            <Divider orientation='vertical' flexItem sx={{ ml: 1 }} />
            <ListItemText primary={address || <Skeleton sx={{ width: '7rem' }} />} secondary={`${source} ${gpsInfo}`} />
          </Stack>
          <Stack direction='row' gap={1}>
            <TextField margin='none' size='small' sx={{ minWidth: '10rem' }} select label='Niveau de zoom' value={zoomLevel}>
              {ZOOM_LEVEL.map(zoomLevel => (
                <MenuItem onClick={handleChangeZoomLevel(zoomLevel.value)} value={zoomLevel.value} key={zoomLevel.label}>
                  {zoomLevel.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField margin='none' size='small' sx={{ minWidth: '10rem' }} select label="Source d'image" value={areaPicture?.actualLayer.id}>
              {otherLayers.map((layer: any) => (
                <MenuItem value={layer.id} onClick={handleChangeLayer(layer)} key={layer.id}>
                  {layer.name}
                </MenuItem>
              ))}
            </TextField>
            <Button color={isExtended ? 'secondary' : 'inherit'}>{isExtended ? "Réinitialiser l'image" : "Recentrer l'image"}</Button>
          </Stack>
          <Tooltip title={`3D par ${threeDFromSegmentation ? 'segmentation' : 'emprise'}`} arrow>
            <Button
              size='small'
              variant='outlined'
              color='secondary'
              onClick={() => setThreeDFromSegmentation(!threeDFromSegmentation)}
              sx={{ textTransform: 'none', fontSize: 11, px: 1.5, py: 0.25, mx: 0.5, whiteSpace: 'nowrap' }}
            >
              3D : {threeDFromSegmentation ? 'Segmentation' : 'Emprise'}
            </Button>
          </Tooltip>
          <ScreenSwitchTabs areaPicture={areaPicture} />
          <Stack direction='row' gap={1} alignItems='center'>
            <Divider orientation='vertical' flexItem />
            <IconButton onClick={(e: MouseEvent<HTMLElement>) => setMenuAnchorEl(e.currentTarget)}>
              <MoreVert />
            </IconButton>
            <Popover
              open={Boolean(menuAnchorEl)}
              anchorEl={toolbarRef.current}
              onClose={() => setMenuAnchorEl(null)}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              marginThreshold={0}
              slotProps={{
                paper: { sx: { minWidth: 200, py: 0.5, borderRadius: '0 0 4px 4px', boxShadow: '0 2px 4px -1px rgba(0,0,0,.1)', borderTop: 'none' } },
              }}
            >
              <MenuItem sx={{ py: 1 }} onClick={() => setMenuAnchorEl(null)}>
                <ListItemIcon>
                  <Download fontSize='small' />
                </ListItemIcon>
                <ListItemText>Exporter en PDF</ListItemText>
              </MenuItem>
              <MenuItem sx={{ py: 1 }} onClick={() => setMenuAnchorEl(null)}>
                <ListItemIcon>
                  <Save fontSize='small' />
                </ListItemIcon>
                <ListItemText>Sauvegarder</ListItemText>
              </MenuItem>
            </Popover>
          </Stack>
        </Toolbar>
      </AppBar>
      <Grid container height='100%' pl={1} mt={8}>
        <Grid
          item
          xs={!shouldAnalyseRoof && screen !== '3d-annotator' ? 8.6 : 12}
          display='flex'
          position='relative'
          justifyContent='center'
          alignItems='start'
          mr='1%'
        >
          <AnnotatorComponent showAddress key={`${analyseRoof}-analyseRoof`} />
        </Grid>
        {!shouldAnalyseRoof && (
          <Grid sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }} flexShrink={0} item xs={3.2}>
            <Stack flexGrow={2} maxHeight={'calc(100vh - 60px)'} position='relative'>
              {screen !== '3d-annotator' && <SideBar />}
            </Stack>
          </Grid>
        )}
      </Grid>
      <Toolbar
        sx={{
          '& .global-rage-container ': {
            '& .MuiTypography-root': {
              textAlign: 'center',
              width: '100%',
              px: 2,
              py: 0.7,
              border: '1px solid black',
              background: PALETTE_COLORS.pine,
              borderRadius: 3,
              color: '#fff',
              fontWeight: 'bold',
            },
          },

          '& .degratation-levels': {
            mt: 0,
            pt: 0,
            '& .degratation-levels-box': {
              width: 40,
              height: 40,
              mt: 0,
              borderRadius: 2,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              transition: 'all 500ms',
              cursor: 'pointer',
            },
            '&:hover': {
              '& .degratation-levels-box:not(.degratation-levels-box-selected)': {
                background: '#D9D9D9',
              },
              '& .degratation-levels-box-selected': {
                transform: 'scale(120%)',
                mx: 2,
              },
            },
          },
        }}
      >
        <Box className='global-rage-container'>
          <Typography>Note de dégradation globale : {globalRate.value}%</Typography>
        </Box>
        <Stack className='degratation-levels' direction='row' justifyContent='center' m={1} gap={1}>
          {degradationLevels.map(({ color, label }) => (
            <Box
              key={label}
              className={`degratation-levels-box ${globalRate.type === label ? 'degratation-levels-box-selected' : ''}`}
              sx={{
                bgcolor: color,
                border: `5px solid ${globalRate.type === label ? 'black' : 'transparent'}`,
              }}
            >
              {label}
            </Box>
          ))}
        </Stack>
      </Toolbar>
      <Typography sx={{ textAlign: 'center', width: '100%', fontSize: 12, fontStyle: 'italic', color: 'text.secondary', mt: 1 }}>
        Disclaimer : rapport généré par IA statistique nécessitant confirmation par votre expert toiture.
      </Typography>
    </FormProvider>
  );
};

const areaPictureFetcher = async (areaPictureId: string) =>
  draftAreaPictureAnnotatorProvider.getList(1, 1, { areaPictureId }) satisfies Promise<AreaPictureAnnotation[]>;

const AnnotatorWithDraftAnnotation = () => {
  const { isAnnotationEmpty, areaPictureAnnotation } = useRetrievePolygons(areaPictureFetcher);
  const replaceAnnotations = annotatorStore.useAnnotatorStore(useShallow(params => params.replaceAnnotations));

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
