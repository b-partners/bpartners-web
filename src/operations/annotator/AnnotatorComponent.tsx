import { BPLoader } from '@/common/components';
import BpSelect from '@/common/components/BpSelect';
import { useAreaPictureDetailsFetcher, usePolygonMarkerFetcher } from '@/common/fetcher';
import { useCanvasAnnotationContext } from '@/common/store';
import { getUrlParams } from '@/common/utils';
import { MEASUREMENT_MAP_ON_EXTENDED_AREA, MEASUREMENT_MAP_ON_EXTENDED_LENGTH } from '@/constants';
import { ZOOM_LEVEL } from '@/constants/zoom-level';
import { AnnotatorCanvas, Measurement } from '@bpartners/annotator-component';
import { AreaPictureMapLayer } from '@bpartners/typescript-client';
import { Box, Stack, Typography } from '@mui/material';
import { FC } from 'react';
import { annotatorButtonsActions, RefocusImageButton } from './components';
import { AnnotatorComponentProps } from './types';

const CONVERTER_BASE_URL = process.env.REACT_APP_ANNOTATOR_GEO_CONVERTER_API_URL || '';
const MAX_ZOOM = 19;

const getZoom = (zoom: number) => Math.min(MAX_ZOOM, zoom);
const AnnotatorComponent: FC<AnnotatorComponentProps> = ({ allowAnnotation = true, polygons: polygonFromProps, allowSelect = true, width, height }) => {
  const { polygons, updatePolygonList, setPolygons } = useCanvasAnnotationContext();
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

  const measurementMapper = (measurement: Measurement): Measurement => {
    if (!isExtended) return measurement;
    return { ...measurement, value: measurement.value * (measurement.unity === 'm²' ? MEASUREMENT_MAP_ON_EXTENDED_AREA : MEASUREMENT_MAP_ON_EXTENDED_LENGTH) };
  };

  if (!filename || areaPictureDetailsMutationLoading || areaPictureDetailsQueryLoading) {
    return <BPLoader sx={{ width: width || undefined }} message="Chargement des données d'annotation..." />;
  }

  return (
    <Box width='100%' height='580px' position='relative'>
      {allowSelect && (
        <Stack direction='row' spacing={1} marginBlock={1}>
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
        <AnnotatorCanvas
          markerPosition={(polygons || []).length === 0 && (polygonFromProps || []).length === 0 && markerPosition}
          allowAnnotation={allowAnnotation}
          width={width || '100%'}
          height={height || '500px'}
          buttonsComponent={annotatorButtonsActions(shiftImage, isExtended)}
          image={getUrlParams(window.location.search, 'imgUrl')}
          setPolygons={updatePolygonList}
          polygonList={polygonFromProps || polygons}
          measurementMapper={measurementMapper}
          polygonLineSizeProps={{
            imageName: `${filename}.jpg`,
            showLineSize: true,
            converterApiUrl: `${CONVERTER_BASE_URL}/api/reference`,
          }}
          zoom={getZoom(newZoomLevelAsNumber)}
        />
      )}
      {Object.keys(layer).length > 0 && (
        <Box sx={{ textAlign: 'center', p: 1, border: '1px solid #ebebeb' }}>
          <Typography variant='body2' style={{ fontWeight: 'bold' }}>
            Source de l'image: {layer.name}, {layer.precisionLevelInCm}cm, {layer.year}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default AnnotatorComponent;
