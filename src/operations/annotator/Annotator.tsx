import { BPLoader } from '@/common/components';
import { useAreaPictureDetailsFetcher } from '@/common/fetcher';
import { useLoadingHandler } from '@/common/hooks';
import { annotatorStore, useAnnotatorScreenSwitch } from '@/common/store';
import { copyObject, parseUrlParams } from '@/common/utils';
import { areaPictureAnnotationToPolygonAndAreaPictureInfo, clearPolygons, getCached } from '@/providers';
import { draftAreaPictureAnnotatorProvider } from '@/providers/draft-area-annotations-provider';
import { AreaPictureAnnotation, AreaPictureDetails } from '@bpartners/typescript-client';
import { Download, MoreVert, Save } from '@mui/icons-material';
import { AppBar, Box, Divider, IconButton, ListItemIcon, ListItemText, MenuItem, Popover, Skeleton, Stack, Toolbar, Typography } from '@mui/material';
import { MouseEvent, useEffect, useRef, useState } from 'react';
import { FormProvider } from 'react-hook-form';
import { useShallow } from 'zustand/react/shallow';
import { useRetrievePolygons } from '../invoice/utils/use-retrieve-polygons';
import { degradationLevels } from '../prospects/constants';
import { AnnotatorComponent } from './AnnotatorComponent';
import { ScreenSwitchTabs } from './components';
import { SideBar } from './SideBar';
import { annotatorAppBarStyle, annotatorBottomToolbarStyle, annotatorDisclaimerStyle, annotatorPopoverPaperStyle } from './style';
import { calculateGlobalRate, useAnnotationInfosForm } from './utils';

const AnnotatorWithDefaultCacheManager = () => {
  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement | null>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const { analyseRoof } = parseUrlParams();
  const replaceAnnotations = annotatorStore.useAnnotatorStore(useShallow(params => params.replaceAnnotations));
  const { currentAreaPictureDetailsToUse, isLoading: isAreaPictureDetailsLoading } = useAreaPictureDetailsFetcher();

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

  if (isLoading || isAreaPictureDetailsLoading) {
    return <BPLoader message='Chargement des données...' />;
  }

  const address = areaPicture?.address;
  const source = areaPicture?.actualLayer?.name;
  const gpsInfo = ` (GPS ${areaPicture?.geoPositions?.[0]?.latitude}, ${areaPicture?.geoPositions?.[0]?.longitude})`;

  const globalRate = calculateGlobalRate();

  return (
    <FormProvider {...annotatorFormState}>
      <AppBar elevation={2} color='inherit' sx={annotatorAppBarStyle} position='fixed'>
        <Toolbar ref={toolbarRef}>
          <Stack className='toolbar-logo-stack' direction='row' gap={1}>
            <img src='/logo.png' alt='birdia-logo' className='toolbar-logo' />
            <Divider className='toolbar-divider-left' orientation='vertical' flexItem />
            <ListItemText primary={address || <Skeleton className='toolbar-address-skeleton' />} secondary={`${source} ${gpsInfo}`} />
          </Stack>
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
                paper: { sx: annotatorPopoverPaperStyle },
              }}
            >
              <MenuItem className='toolbar-menu-item' onClick={() => setMenuAnchorEl(null)}>
                <ListItemIcon>
                  <Download fontSize='small' />
                </ListItemIcon>
                <ListItemText>Exporter en PDF</ListItemText>
              </MenuItem>
              <MenuItem className='toolbar-menu-item' onClick={() => setMenuAnchorEl(null)}>
                <ListItemIcon>
                  <Save fontSize='small' />
                </ListItemIcon>
                <ListItemText>Sauvegarder</ListItemText>
              </MenuItem>
            </Popover>
          </Stack>
        </Toolbar>
      </AppBar>
      <Toolbar />
      <Stack direction='row' gap={1} sx={{ pl: 1, mt: 0.5, height: 'calc(100vh - 130px)' }}>
        <AnnotatorComponent showAddress key={`${analyseRoof}-analyseRoof`} />
        {!shouldAnalyseRoof && screen !== '3d-annotator' && <SideBar />}
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
      </Toolbar>
      <Typography sx={annotatorDisclaimerStyle}>Disclaimer : rapport généré par IA statistique nécessitant confirmation par votre expert toiture.</Typography>
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
