import { BPLoader } from '@/common/components';
import BpSelect from '@/common/components/BpSelect';
import { useAreaPictureDetailsFetcher, useGeojsonQueryResult, usePolygonMarkerFetcher } from '@/common/fetcher';
import { useGetElementSize, useToggle } from '@/common/hooks';
import { useAnnotatorComponentStore, useCanvasAnnotationContext } from '@/common/store';
import { getUrlParams, useWrappedSearchParams } from '@/common/utils';
import { ZOOM_LEVEL } from '@/constants/zoom-level';
import { AnnotatorCanvas } from '@bpartners/annotator-component';
import { AreaPictureMapLayer } from '@bpartners/typescript-client';
import { Public } from '@mui/icons-material';
import { Box, Stack, SxProps, Typography } from '@mui/material';
import { FC, useEffect } from 'react';
import { degradationLevels } from '../prospects/constants';
import { AnalyseResultButton, annotatorButtonsActions, LlmResult, LlmSwitchButton, RefocusImageButton } from './components';
import { addressStyle } from './style';
import { AnnotatorComponentProps } from './types';
import { AnalyseRoofButton, annotatorComponentStyle, createRoofPolygon, getNewPolygonColor, isRoofPolygon, measurementMapper } from './utils';

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
  defaultAnnotationInfos,
  draftAnnotationId,
}) => {
  const { geoJsonResultUrl } = useAnnotatorComponentStore();

  const { data, isPending } = useGeojsonQueryResult([geoJsonResultUrl], !!geoJsonResultUrl);

  const { address } = useWrappedSearchParams(['address']);
  const { polygons, setPolygons, setRoofAnalyseProperties } = useCanvasAnnotationContext();
  const { data: markerPosition, mutate: mutateMarker } = usePolygonMarkerFetcher();
  const { query: areaPictureDetailsQuery, mutation: areaPictureDetailsMutation } = useAreaPictureDetailsFetcher(mutateMarker);
  const { data: areaPictureDetailsQueried, isLoading: areaPictureDetailsQueryLoading } = areaPictureDetailsQuery;
  const { data: areaPictureDetailsMutated, mutate: mutateAreaPictureDetail, isPending: areaPictureDetailsMutationLoading } = areaPictureDetailsMutation;

  // Get the Area picture details to use
  const currentAreaPictureDetailsToUse = areaPictureDetailsMutated || areaPictureDetailsQueried || { zoom: {} };
  const { filename, isExtended, shiftNb, zoom, actualLayer: layer, otherLayers } = currentAreaPictureDetailsToUse;
  const { level: newZoomLevel, number: newZoomLevelAsNumber } = zoom;
  // Get the Area picture details to use

  const { ref: containerHeightRef, height: containerheight, width: containerWidth } = useGetElementSize([filename]);
  const { toggleValue: toogleLLMResultView, value: showLLMResult } = useToggle(false);

  useEffect(() => {
    setRoofAnalyseProperties(data?.properties);
    const currentPolygons = createRoofPolygon(data?.properties?.roof_area_in_m2, data?.polygons);
    if (polygons.length === 0 && currentPolygons.length > 0 && data?.properties && data?.image) setPolygons(currentPolygons || []);
  }, [JSON.stringify(data), isPending]);

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

  if (!filename || areaPictureDetailsMutationLoading || areaPictureDetailsQueryLoading || (geoJsonResultUrl && !data?.image)) {
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
      {showAddress && (
        <Box sx={addressStyle}>
          <Stack direction='row' gap={1}>
            <Public />
            <Typography>Adresse: {address}</Typography>
          </Stack>
        </Box>
      )}
      {filename && (
        <Box className='annotator-canvas-container' ref={containerHeightRef}>
          {containerWidth > 0 && !showLLMResult && (!geoJsonResultUrl || data?.image) && (
            <Box height='95%'>
              <AnnotatorCanvas
                markerPosition={!data && (polygons || []).length === 0 && (polygonFromProps || []).length === 0 && markerPosition}
                allowAnnotation={allowAnnotation}
                width={width || containerWidth}
                height={height || containerheight * 0.95}
                buttonsComponent={buttonComponent ?? annotatorButtonsActions(shiftImage, isExtended, currentAreaPictureDetailsToUse)}
                image={data?.image || getUrlParams(window.location.search, 'imgUrl')}
                setPolygons={setPolygons}
                polygonList={(polygonFromProps || polygons).map(p => (isRoofPolygon(p.points) ? { ...p, isInvisible: true } : p))}
                measurementMapper={!data && measurementMapper(isExtended)}
                getNewPolygonColor={getNewPolygonColor}
                polygonLineSizeProps={
                  !data && {
                    imageName: `${filename}.jpg`,
                    showLineSize: true,
                    converterApiUrl: `${CONVERTER_BASE_URL}`,
                  }
                }
                zoom={newZoomLevelAsNumber}
              />
            </Box>
          )}
          {data?.properties && showLLMResult && (
            <LlmResult width={width || containerWidth} height={height || containerheight} roofAnalyseProperties={data?.properties} />
          )}
          {data && (
            <Stack direction='row' justifyContent='space-between' alignItems='center'>
              <LlmSwitchButton showLlmResult={showLLMResult} enabled={!!data?.properties} onClick={toogleLLMResultView} />
              <Stack className='degratation-levels' direction='row' justifyContent='center' m={1} gap={1}>
                {degradationLevels.map(({ color, label }) => (
                  <Box
                    key={label}
                    className={`degratation-levels-box ${data?.properties?.global_rate_type === label ? 'degratation-levels-box-selected' : ''}`}
                    sx={{ bgcolor: color, border: `5px solid ${data?.properties?.global_rate_type === label ? 'black' : 'transparent'}` }}
                  >
                    {label}
                  </Box>
                ))}
              </Stack>
              <Box className='global-rage-container'>
                <Typography>Note de dégradation globale : {data?.properties?.global_rate_value}%</Typography>
              </Box>
            </Stack>
          )}
        </Box>
      )}
      {!data && showFileSource && Object.keys(layer).length > 0 && (
        <Stack direction='row' className='bottom-action'>
          <AnalyseRoofButton disabled={polygons.length !== 1} areaPicture={areaPictureDetailsQueried || areaPictureDetailsMutated} polygons={polygons} />
        </Stack>
      )}
      <AnalyseResultButton defaultAnnotationInfos={defaultAnnotationInfos} draftAnnotationId={draftAnnotationId} />
    </Box>
  );
};
