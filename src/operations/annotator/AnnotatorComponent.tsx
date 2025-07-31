import { BPLoader } from '@/common/components';
import BpSelect from '@/common/components/BpSelect';
import { useAreaPictureDetailsFetcher, useGeojsonQueryResult, usePolygonMarkerFetcher } from '@/common/fetcher';
import { useGetElementSize } from '@/common/hooks';
import { useCanvasAnnotationContext } from '@/common/store';
import { getUrlParams, parseUrlParams, useWrappedSearchParams } from '@/common/utils';
import { MEASUREMENT_MAP_ON_EXTENDED_AREA, MEASUREMENT_MAP_ON_EXTENDED_LENGTH } from '@/constants';
import { ZOOM_LEVEL } from '@/constants/zoom-level';
import { AnnotatorCanvas, Measurement, Polygon } from '@bpartners/annotator-component';
import { AreaPictureMapLayer } from '@bpartners/typescript-client';
import { Box, Chip, Divider, Paper, Stack, SxProps, Typography } from '@mui/material';
import { FC, useEffect } from 'react';
import { degradationLevels } from '../prospects/constants';
import { annotatorButtonsActions, RefocusImageButton } from './components';
import { AnnotatorComponentProps } from './types';
import { AnalyseRoofButton, annotatorComponentStyle, getNewPolygonColor } from './utils';

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
  const { data, isPending } = useGeojsonQueryResult();

  const { address } = useWrappedSearchParams(['address']);
  const { polygons, setPolygons, setRoofAnalyseProperties } = useCanvasAnnotationContext();
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
  const { ref: containerHeightRef, height: containerheight, width: containerWidth } = useGetElementSize([filename]);

  const { analyseRoof } = parseUrlParams();
  const shouldAnalyseRoof = analyseRoof === 'true';

  useEffect(() => {
    const currentPolygons: Polygon[] = [{ fillColor: '', id: 'roof-polygon', points: [], isInvisible: true, strokeColor: '' }, ...(data?.polygons || [])];
    console.log(currentPolygons);
    if (polygons.length === 0) setPolygons(data?.polygons || []);
    setRoofAnalyseProperties(data?.properties);
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

  const onRoofAnalyseAllowAnnotation = !shouldAnalyseRoof || polygons.length === 0;

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
        <Box className='annotator-canvas-container' ref={containerHeightRef}>
          {containerWidth > 0 && (
            <AnnotatorCanvas
              markerPosition={!data && (polygons || []).length === 0 && (polygonFromProps || []).length === 0 && markerPosition}
              allowAnnotation={allowAnnotation && onRoofAnalyseAllowAnnotation}
              width={width || containerWidth}
              height={height || containerheight * 0.95}
              buttonsComponent={buttonComponent ?? annotatorButtonsActions(shiftImage, isExtended)}
              image={getUrlParams(window.location.search, 'imgUrl')}
              setPolygons={setPolygons}
              polygonList={polygonFromProps || polygons}
              measurementMapper={!data && measurementMapper}
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
          )}
        </Box>
      )}
      {showFileSource && Object.keys(layer).length > 0 && (
        <Stack direction='row' className='bottom-action'>
          <Stack direction='row'>
            {showAddress && (
              <>
                <Typography variant='body2' sx={{ my: 1 }}>
                  <span style={{ fontWeight: 'bold' }}>Adresse:</span> {address}
                </Typography>
                <Divider orientation='vertical' variant='middle' flexItem />
              </>
            )}
            <Typography variant='body2'>
              <span style={{ fontWeight: 'bold' }}>Source de l'image:</span> {layer.name}, {layer.precisionLevelInCm}cm, {layer.year}
            </Typography>
          </Stack>
          {shouldAnalyseRoof && <AnalyseRoofButton areaPicture={areaPictureDetailsQueried || areaPictureDetailsMutated} polygons={polygons} />}
        </Stack>
      )}
      {data && (
        <>
          <Paper sx={{ background: '#BEB4A4 !important', px: '10rem', py: 2, borderRadius: 2, textTransform: 'uppercase', mt: 0.5 }}>
            <Typography sx={{ textAlign: 'center', width: '100%' }}>
              Note de dégradation globale : <strong>{data?.properties?.global_rate_value}%</strong>
            </Typography>
          </Paper>
          <Stack direction='row' justifyContent='center' m={1} gap={1}>
            {degradationLevels.map(({ color, label }) => (
              <Chip
                key={`${color}-${label}`}
                label={label}
                sx={{ px: 1, bgcolor: color, border: `5px solid ${data?.properties?.global_rate_type === label ? 'black' : 'transparent'}` }}
              />
            ))}
          </Stack>
        </>
      )}
    </Box>
  );
};
