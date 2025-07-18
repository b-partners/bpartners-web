import { PALETTE_COLORS } from '@/bp-theme';
import { BPLoader } from '@/common/components';
import BpSelect from '@/common/components/BpSelect';
import { useAreaPictureDetailsFetcher, usePolygonMarkerFetcher } from '@/common/fetcher';
import { useGetElementSize } from '@/common/hooks';
import { useCanvasAnnotationContext } from '@/common/store';
import { getUrlParams, useWrappedSearchParams } from '@/common/utils';
import { MEASUREMENT_MAP_ON_EXTENDED_AREA, MEASUREMENT_MAP_ON_EXTENDED_LENGTH } from '@/constants';
import { ZOOM_LEVEL } from '@/constants/zoom-level';
import { AnnotatorCanvas, Measurement, Polygon } from '@bpartners/annotator-component';
import { AreaPictureMapLayer } from '@bpartners/typescript-client';
import { Box, Stack, SxProps, Typography } from '@mui/material';
import { FC } from 'react';
import { annotatorButtonsActions, RefocusImageButton } from './components';
import { AnnotatorComponentProps } from './types';
import { getNewPolygonColor } from './utils/annotation-colors';
import { annotatorComponentStyle } from './utils/style';

const CONVERTER_BASE_URL = process.env.REACT_APP_ANNOTATOR_GEO_CONVERTER_API_URL || '';
export const AnnotatorComponent: FC<AnnotatorComponentProps> = ({
  boxWrapperSx = {},
  showAddress = false,
  showFileSource = true,
  buttonComponent,
  allowAnnotation = true,
  polygons: polygonFromProps,
  allowSelect = true,
  width,
  height,
}) => {
  const { address } = useWrappedSearchParams(['address']);
  const { polygons, setPolygons } = useCanvasAnnotationContext();
  const { data: markerPosition, mutate: mutateMarker } = usePolygonMarkerFetcher();
  const { query: areaPictureDetailsQuery, mutation: areaPictureDetailsMutation } = useAreaPictureDetailsFetcher(mutateMarker);
  const { data: areaPictureDetailsQueried, isLoading: areaPictureDetailsQueryLoading } = areaPictureDetailsQuery;
  const { data: areaPictureDetailsMutated, mutate: mutateAreaPictureDetail, isPending: areaPictureDetailsMutationLoading } = areaPictureDetailsMutation;
  const {
    filename,
    isExtended,
    shiftNb,
    zoom: { level: newZoomLevel, number: newZoomLevelAsNumber },
    actualLayer: layer,
    otherLayers,
  } = areaPictureDetailsMutated || areaPictureDetailsQueried || { zoom: {} };
  const { ref: containerRef, height: containerheight } = useGetElementSize([filename]);

  const handleZoomLvl = async (e: any) => {
    mutateAreaPictureDetail({ zoomLevel: e.target.value });
  };

  const handleLayerChanger = async (e: any) => {
    const selectedLayer = otherLayers.find(layer => layer.name === e.target.value);
    mutateAreaPictureDetail({ zoomLevel: newZoomLevel, layerId: selectedLayer.id });
  };

  const refocusImgClick = async () => {
    mutateAreaPictureDetail({ zoomLevel: newZoomLevel, isExtended: !isExtended });
    setPolygons([]);
  };

  const shiftImage = (shift: number) => {
    if (isExtended) {
      mutateAreaPictureDetail({ zoomLevel: newZoomLevel, isExtended: true, shiftNb: (shiftNb || 0) + shift });
      setPolygons([]);
    }
  };

  const measurementMapper = (measurement: Measurement, currentPolygons: Polygon[] = []): Measurement => {
    const firstPolygon = currentPolygons[0];
    const isInvisible = firstPolygon?.id !== measurement.polygonId;
    if (!isExtended) return { ...measurement, isInvisible };
    return {
      ...measurement,
      isInvisible,
      value: measurement.value * (measurement.unity === 'm²' ? MEASUREMENT_MAP_ON_EXTENDED_AREA : MEASUREMENT_MAP_ON_EXTENDED_LENGTH),
    };
  };

  if (!filename || areaPictureDetailsMutationLoading || areaPictureDetailsQueryLoading) {
    return <BPLoader sx={{ width: width || undefined }} message="Chargement des données d'annotation..." />;
  }

  return (
    <Box sx={{ ...annotatorComponentStyle, ...boxWrapperSx } as SxProps}>
      {allowSelect && (
        <Stack className='image-properties-actions' direction='row' spacing={1} marginBlock={1}>
          <BpSelect
            value={newZoomLevel}
            handleChange={handleZoomLvl}
            options={ZOOM_LEVEL}
            getOptionKey={(option: any) => option.lvl}
            getOptionValue={(option: any) => option.value}
            getOptionLabel={(option: any) => option.label}
            label='Niveau de zoom'
          />
          <BpSelect
            value={layer.name || ''}
            handleChange={handleLayerChanger}
            options={otherLayers}
            getOptionKey={(option: AreaPictureMapLayer) => option.id}
            getOptionValue={(option: AreaPictureMapLayer) => option.name}
            getOptionLabel={(option: AreaPictureMapLayer) => `${option.name} ${option.year} ${option.precisionLevelInCm}cm`}
            label="Source d'image"
          />
          <RefocusImageButton onAccept={refocusImgClick} isExtended={isExtended} />
        </Stack>
      )}
      {filename && (
        <Box className='annotator-canvas-container' ref={containerRef}>
          <AnnotatorCanvas
            markerPosition={(polygons || []).length === 0 && (polygonFromProps || []).length === 0 && markerPosition}
            allowAnnotation={allowAnnotation}
            width={width || '100%'}
            height={height || containerheight}
            buttonsComponent={buttonComponent ?? annotatorButtonsActions(shiftImage, isExtended)}
            image={getUrlParams(window.location.search, 'imgUrl')}
            setPolygons={setPolygons}
            polygonList={polygonFromProps || polygons}
            measurementMapper={measurementMapper}
            getNewPolygonColor={getNewPolygonColor}
            polygonLineSizeProps={{
              imageName: `${filename}.jpg`,
              showLineSize: true,
              converterApiUrl: `${CONVERTER_BASE_URL}`,
            }}
            zoom={newZoomLevelAsNumber}
          />
        </Box>
      )}
      {showFileSource && Object.keys(layer).length > 0 && (
        <Box sx={{ color: PALETTE_COLORS.cream, textAlign: 'center', width, p: 2, bgcolor: PALETTE_COLORS.pine, border: '1px solid #ebebeb' }}>
          {showAddress && (
            <Typography variant='body2' sx={{ my: 1 }}>
              <span style={{ fontWeight: 'bold' }}>Adresse:</span> {address}
            </Typography>
          )}
          <Typography variant='body2'>
            <span style={{ fontWeight: 'bold' }}>Source de l'image:</span> {layer.name}, {layer.precisionLevelInCm}cm, {layer.year}
          </Typography>
        </Box>
      )}
    </Box>
  );
};
