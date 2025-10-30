import { BPLoader } from '@/common/components';
import BpSelect from '@/common/components/BpSelect';
import { useAreaPictureDetailsFetcher, useGeojsonQueryResult, usePolygonMarkerFetcher } from '@/common/fetcher';
import { useGetElementSize, useToggle } from '@/common/hooks';
import { useAnnotatorComponentStore } from '@/common/store';
import { getUrlParams, parseUrlParams, useWrappedSearchParams } from '@/common/utils';
import { ZOOM_LEVEL } from '@/constants/zoom-level';
import { AnnotatorCanvas, Polygon } from '@bpartners/annotator-component';
import { AreaPictureMapLayer } from '@bpartners/typescript-client';
import { Public as PublicIcon } from '@mui/icons-material';
import { Box, Stack, SxProps, Typography } from '@mui/material';
import { Dispatch, FC, SetStateAction, useEffect } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { degradationLevels } from '../prospects/constants';
import { AnalyseResultButton, annotatorButtonsActions, LlmResult, LlmSwitchButton, RefocusImageButton } from './components';
import { addressStyle } from './style';
import { AnnotatorComponentProps } from './types';
import {
  AnalyseRoofButton,
  annotatorComponentStyle,
  AnnotatorFormState,
  AnnotatorHelpButton,
  createAnnotationInfoFromRoofAnalyseProperties,
  createDefaultAnnotationInfo,
  getNewPolygonColor,
  measurementMapper,
  useLlmResultQuery,
} from './utils';

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
  draftAnnotationId,
  isInvoiceForm,
}) => {
  const annotatorFormState = useFormContext<AnnotatorFormState>();
  const { address } = useWrappedSearchParams(['address']);
  const polygons = useWatch<AnnotatorFormState, 'polygons'>({ name: 'polygons', defaultValue: [] });

  const { geoJsonResultUrl, globalRate, llm: draftLlmValue, setAreaPictureDetails, setRoofAnalyseProperties } = useAnnotatorComponentStore();
  const { data, isPending } = useGeojsonQueryResult([geoJsonResultUrl], !!geoJsonResultUrl);
  const { data: markerPosition, mutate: mutateMarker } = usePolygonMarkerFetcher();
  const { query: areaPictureDetailsQuery, mutation: areaPictureDetailsMutation } = useAreaPictureDetailsFetcher(mutateMarker);
  const { data: areaPictureDetailsQueried, isLoading: areaPictureDetailsQueryLoading } = areaPictureDetailsQuery;
  const { data: areaPictureDetailsMutated, mutate: mutateAreaPictureDetail, isPending: areaPictureDetailsMutationLoading } = areaPictureDetailsMutation;

  // Get the Area picture details to use
  const currentAreaPictureDetailsToUse = areaPictureDetailsMutated || areaPictureDetailsQueried || { zoom: {} };

  useEffect(() => {
    setAreaPictureDetails(currentAreaPictureDetailsToUse);
  }, [JSON.stringify(currentAreaPictureDetailsToUse)]);

  const { filename, isExtended, shiftNb, zoom, actualLayer: layer, otherLayers } = currentAreaPictureDetailsToUse;
  const { level: newZoomLevel, number: newZoomLevelAsNumber } = zoom;
  // Get the Area picture details to use

  const { ref: containerHeightRef, height: containerHeight, width: containerWidth } = useGetElementSize([filename]);
  const { toggleValue: toggleLLMResultView, value: showLLMResult } = useToggle(false);
  const { useDrafts } = parseUrlParams();

  const setPolygons: Dispatch<SetStateAction<Polygon[]>> = params => {
    if (typeof params === 'function') return annotatorFormState.setValue('polygons', params(annotatorFormState.getValues('polygons')));
    annotatorFormState.setValue('polygons', params);
  };

  const addPolygon = (currentPolygons: Polygon[]) => {
    const oldPolygons = annotatorFormState.getValues('polygons');
    const setOldPolygonId = new Set(oldPolygons.map(({ id }) => id));
    const newPolygon = currentPolygons.find(currentPolygon => !setOldPolygonId.has(currentPolygon.id));
    if (!newPolygon) return false;
    const newAnnotatorInfo = createDefaultAnnotationInfo(newPolygon, currentPolygons.length - 1);

    annotatorFormState.setValue('annotationInfos', [...annotatorFormState.getValues('annotationInfos'), newAnnotatorInfo], { shouldDirty: true });
    annotatorFormState.setValue('polygons', currentPolygons, { shouldDirty: true });
  };

  useEffect(() => {
    useDrafts !== 'true' && setPolygons(p => (p.length < 2 ? [] : p));
    setRoofAnalyseProperties(data?.properties);

    const currentPolygons = data?.polygons?.slice(1) || [];
    const roofPolygon = data?.polygons?.[0];

    if (polygons.length === 0 && currentPolygons.length > 0 && data?.properties && data?.image) {
      const roofAnnotationInfo = createAnnotationInfoFromRoofAnalyseProperties(
        roofPolygon.id,
        data?.properties,
        data?.properties?.roof_height_in_meters,
        data?.properties?.roof_slope_in_degrees
      );

      const annotationInfos = data?.polygons?.slice(1).map((polygon, index) => createDefaultAnnotationInfo(polygon, index));

      annotatorFormState.setValue('polygons', [roofPolygon, ...currentPolygons], { shouldDirty: true });
      annotatorFormState.setValue('annotationInfos', [roofAnnotationInfo, ...annotationInfos], { shouldDirty: true });
    }
  }, [JSON.stringify(data), isPending]);

  const handleZoomLvl = async (e: any) => {
    mutateAreaPictureDetail({ zoomLevel: e.target.value });
  };

  const handleLayerChanger = async (e: any) => {
    const selectedLayer = otherLayers.find((layer: any) => layer.name === e.target.value);
    mutateAreaPictureDetail({ zoomLevel: newZoomLevel, layerId: selectedLayer.id });
  };

  const refocusImgClick = async () => {
    mutateAreaPictureDetail({ zoomLevel: newZoomLevel, isExtended: !isExtended });
    setPolygons([]);
    annotatorFormState.setValue('annotationInfos', [], { shouldDirty: true });
  };

  const shiftImage = (shift: number) => {
    if (isExtended) {
      mutateAreaPictureDetail({ zoomLevel: newZoomLevel, isExtended: true, shiftNb: (shiftNb || 0) + shift });
      setPolygons([]);
      annotatorFormState.setValue('annotationInfos', [], { shouldDirty: true });
    }
  };

  const { data: htmlResult, isPending: isLlmResultPending } = useLlmResultQuery(data?.properties);

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
        <Stack direction='row' gap={1} sx={addressStyle}>
          <Stack direction='row' gap={1}>
            <PublicIcon />
            <Typography>Adresse: {address}</Typography>
          </Stack>
          <AnnotatorHelpButton />
        </Stack>
      )}
      {filename && (
        <Box className='annotator-canvas-container' ref={containerHeightRef}>
          {containerWidth > 0 && !showLLMResult && (!geoJsonResultUrl || data?.image) && (
            <Box height='95%'>
              <AnnotatorCanvas
                markerPosition={!data && (polygons || []).length === 0 && (polygonFromProps || []).length === 0 && markerPosition}
                allowAnnotation={allowAnnotation}
                width={width || containerWidth}
                height={height || containerHeight * 0.95}
                buttonsComponent={buttonComponent ?? annotatorButtonsActions(shiftImage, isExtended, currentAreaPictureDetailsToUse)}
                image={data?.image || getUrlParams(window.location.search, 'imgUrl')}
                setPolygons={addPolygon}
                polygonList={polygonFromProps || polygons}
                measurementMapper={measurementMapper(isExtended)}
                getNewPolygonColor={getNewPolygonColor}
                polygonLineSizeProps={{
                  imageName: `${filename}.jpg`,
                  showLineSize: true,
                  converterApiUrl: `${CONVERTER_BASE_URL}`,
                }}
                zoom={newZoomLevelAsNumber}
                closeOnNear
              />
            </Box>
          )}
          {(data?.properties || draftLlmValue) && showLLMResult && (
            <LlmResult
              width={width || containerWidth}
              height={height || containerHeight}
              htmlResult={htmlResult || draftLlmValue}
              isLoading={isLlmResultPending}
            />
          )}
          {(data || globalRate) && (
            <Stack direction='row' justifyContent='space-between' alignItems='center'>
              <LlmSwitchButton showLlmResult={showLLMResult} enabled={!!data?.properties || !!draftLlmValue} onClick={toggleLLMResultView} />
              <Stack className='degratation-levels' direction='row' justifyContent='center' m={1} gap={1}>
                {degradationLevels.map(({ color, label }) => (
                  <Box
                    key={label}
                    className={`degratation-levels-box ${(data?.properties?.global_rate_type || globalRate?.type) === label ? 'degratation-levels-box-selected' : ''}`}
                    sx={{
                      bgcolor: color,
                      border: `5px solid ${(data?.properties?.global_rate_type || globalRate?.type) === label ? 'black' : 'transparent'}`,
                    }}
                  >
                    {label}
                  </Box>
                ))}
              </Stack>
              <Box className='global-rage-container'>
                <Typography>Note de dégradation globale : {data?.properties?.global_rate_value || globalRate?.value}%</Typography>
              </Box>
            </Stack>
          )}
        </Box>
      )}
      {!data && showFileSource && Object.keys(layer).length > 0 && !draftLlmValue && (
        <Stack direction='row' className='bottom-action'>
          <AnalyseRoofButton disabled={polygons.length !== 1} areaPicture={currentAreaPictureDetailsToUse} polygons={polygons} />
        </Stack>
      )}
      {!isInvoiceForm && (
        <AnalyseResultButton
          analyseProperties={data?.properties}
          image={data?.image}
          isCropped={!!data?.image}
          areaPictureDetails={currentAreaPictureDetailsToUse}
          draftAnnotationId={draftAnnotationId}
        />
      )}
    </Box>
  );
};
