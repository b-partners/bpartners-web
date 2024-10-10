import { BPLoader } from '@/common/components';
import BpSelect from '@/common/components/BpSelect';
import { useAreaPictureDetailsFetcher, usePolygonMarkerFetcher } from '@/common/fetcher';
import { useCanvasAnnotationContext } from '@/common/store';
import { getUrlParams } from '@/common/utils';
import { ZOOM_LEVEL } from '@/constants/zoom-level';
import { AnnotatorCanvas } from '@bpartners/annotator-component';
import { AreaPictureMapLayer } from '@bpartners/typescript-client';
import { ArrowLeft, ArrowRight, ZoomIn, ZoomInMap, ZoomOut } from '@mui/icons-material';
import { Box, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import { FC } from 'react';
import { RefocusDialog } from './RefocusDialog';
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
    if (areaPictureDetailsMutated.isExtended) {
      mutateAreaPictureDetail({ zoomLevel: newZoomLevel, isExtended: true, shiftNb: (areaPictureDetailsMutated.shiftNb || 0) + shift });
      setPolygons([]);
    }
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
          <RefocusDialog onAccept={refocusImgClick} disabled={isExtended} />
        </Stack>
      )}
      {filename && (
        <AnnotatorCanvas
          markerPosition={(polygons || []).length === 0 && (polygonFromProps || []).length === 0 && markerPosition}
          allowAnnotation={allowAnnotation}
          width={width || '100%'}
          height={height || '500px'}
          buttonsComponent={({ scaleDown, scaleReste, scaleUp }) => (
            <Stack direction='row' gap={2}>
              <Tooltip onClick={scaleUp} title='Zoom +'>
                <IconButton>
                  <ZoomIn />
                </IconButton>
              </Tooltip>
              <Tooltip onClick={scaleReste} title='Reset'>
                <IconButton>
                  <ZoomInMap />
                </IconButton>
              </Tooltip>
              <Tooltip onClick={scaleDown} title='Zoom -'>
                <IconButton>
                  <ZoomOut />
                </IconButton>
              </Tooltip>
              {areaPictureDetailsMutated?.isExtended && (
                <>
                  <Tooltip onClick={() => shiftImage(-1)} title="Décaler l'image vers le gauche">
                    <IconButton>
                      <ArrowLeft />
                    </IconButton>
                  </Tooltip>
                  <Tooltip onClick={() => shiftImage(+1)} title="Décaler l'image vers la droite">
                    <IconButton>
                      <ArrowRight />
                    </IconButton>
                  </Tooltip>
                </>
              )}
            </Stack>
          )}
          image={getUrlParams(window.location.search, 'imgUrl')}
          setPolygons={updatePolygonList}
          polygonList={polygonFromProps || polygons}
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
