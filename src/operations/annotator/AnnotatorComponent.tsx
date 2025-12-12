import { BPLoader } from '@/common/components';
import BpSelect from '@/common/components/BpSelect';
import { useAreaPictureDetailsFetcher, useGeojsonQueryResult, usePolygonMarkerFetcher, useRoofAnalyseQuery } from '@/common/fetcher';
import { useGetElementSize } from '@/common/hooks';
import { useAnnotatorComponentStore, useAnnotatorScreenSwitch } from '@/common/store';
import { getUrlParams, parseUrlParams, useWrappedSearchParams } from '@/common/utils';
import { ZOOM_LEVEL } from '@/constants/zoom-level';
import { clearPolygons } from '@/providers';
import { AnnotatorCanvas } from '@bpartners/annotator-component';
import { AreaPictureMapLayer } from '@bpartners/typescript-client';
import { Public as PublicIcon } from '@mui/icons-material';
import { Box, Stack, SxProps, Typography } from '@mui/material';
import { FC, useEffect, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { degradationLevels } from '../prospects/constants';
import {
  AnalyseResultButton,
  Annotator3D,
  Annotator3DSwitchButton,
  annotatorButtonsActions,
  LlmResult,
  LlmSwitchButton,
  RefocusImageButton,
} from './components';
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
  const polygons = useWatch<AnnotatorFormState, 'polygons'>({ name: 'polygons', defaultValue: [], control: annotatorFormState.control });
  const [localPolygon, setLocalPolygon] = useState(polygonFromProps || []);

  const { geoJsonResultUrl, globalRate, llm: draftLlmValue, roofDelimiter, setAreaPictureDetails, setRoofAnalyseProperties } = useAnnotatorComponentStore();
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
  const { screen } = useAnnotatorScreenSwitch();
  const { useDrafts } = parseUrlParams();

  useEffect(() => {
    const oldPolygons = annotatorFormState.getValues('polygons');
    const setOldPolygonId = new Set(oldPolygons.map(({ id }) => id));
    const newPolygon = localPolygon.find(currentPolygon => !setOldPolygonId.has(currentPolygon.id));
    if (newPolygon) {
      const newAnnotatorInfo = createDefaultAnnotationInfo(newPolygon, localPolygon.length - 1);
      annotatorFormState.setValue('annotationInfos', [...annotatorFormState.getValues('annotationInfos'), newAnnotatorInfo], { shouldDirty: true });
    }
    if (JSON.stringify(localPolygon) !== JSON.stringify(oldPolygons)) annotatorFormState.setValue('polygons', localPolygon, { shouldDirty: true });
  }, [localPolygon]);

  useEffect(() => {
    const observer = annotatorFormState.watch(({ polygons }) => {
      if (polygons.length !== localPolygon.length) {
        setLocalPolygon(polygons as any);
      }
    });
    return observer.unsubscribe;
  }, [localPolygon]);

  useEffect(() => {
    const currentFormPolygons = annotatorFormState.getValues('polygons');
    if (useDrafts !== 'true' && currentFormPolygons.length < 2) annotatorFormState.setValue('polygons', [], { shouldDirty: true });
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

      annotatorFormState.setValue('polygons', [roofPolygon, ...currentPolygons], { shouldDirty: true, shouldTouch: true });
      annotatorFormState.setValue('annotationInfos', [roofAnnotationInfo, ...annotationInfos], { shouldDirty: true, shouldTouch: true });
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
    annotatorFormState.setValue('polygons', []), { shouldDirty: true };
    annotatorFormState.setValue('annotationInfos', [], { shouldDirty: true });
  };

  const shiftImage = (shift: number) => {
    if (isExtended) {
      mutateAreaPictureDetail({ zoomLevel: newZoomLevel, isExtended: true, shiftNb: (shiftNb || 0) + shift });
      annotatorFormState.setValue('polygons', []), { shouldDirty: true };
      annotatorFormState.setValue('annotationInfos', [], { shouldDirty: true });
    }
  };

  const { data: htmlResult, isPending: isLlmResultPending } = useLlmResultQuery(data?.properties);

  const handleDetectionProcessingSuccess = () => {
    annotatorFormState.setValue('polygons', [], { shouldDirty: true });
    annotatorFormState.setValue('annotationInfos', [], { shouldDirty: true });
    clearPolygons(false);
  };

  const { mutate: processDetection, isPending: isDetectionProcessing } = useRoofAnalyseQuery(
    polygons || [],
    currentAreaPictureDetailsToUse,
    handleDetectionProcessingSuccess
  );

  if (!filename || areaPictureDetailsMutationLoading || areaPictureDetailsQueryLoading || (geoJsonResultUrl && !data?.image)) {
    return <BPLoader sx={{ width: width || undefined }} message="Chargement des données d'annotation..." />;
  }

  const imageSrcFromUrl =
    `${getUrlParams(window.location.search, 'imgUrl')}` +
    // Not necessary for the real image URL,
    // Used to force AnnotatorComponent to refresh
    `&isExtended=${isExtended}` +
    `&zoom=${currentAreaPictureDetailsToUse?.zoom?.number}` +
    `&layer=${currentAreaPictureDetailsToUse?.actualLayer?.id}`;

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
          {containerWidth > 0 && screen === 'annotator' && (!geoJsonResultUrl || data?.image) && (
            <AnnotatorCanvas
              markerPosition={!data && (polygons || []).length === 0 && (polygonFromProps || []).length === 0 && markerPosition}
              allowAnnotation={allowAnnotation}
              width={width || containerWidth}
              height={height || containerHeight + 50}
              buttonsComponent={buttonComponent ?? annotatorButtonsActions(shiftImage, isExtended, currentAreaPictureDetailsToUse)}
              image={data?.image || imageSrcFromUrl}
              setPolygons={setLocalPolygon}
              polygonList={localPolygon}
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
          )}
          <Annotator3D
            polygons={polygons}
            active={screen === '3d-annotator'}
            width={width || containerWidth}
            height={height || containerHeight}
            areaPicture={currentAreaPictureDetailsToUse}
          />
          {(data?.properties || draftLlmValue) && screen === 'llm' && (
            <LlmResult
              width={width || containerWidth}
              height={height || containerHeight}
              htmlResult={htmlResult || draftLlmValue}
              isLoading={isLlmResultPending}
            />
          )}
        </Box>
      )}

      {filename && (data || globalRate) && (
        <Stack>
          <Stack direction='row' justifyContent='space-between' alignItems='center'>
            <Box className='global-rage-container'>
              <Typography>Note de dégradation globale : {data?.properties?.global_rate_value || globalRate?.value}%</Typography>
            </Box>
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
          </Stack>
          <Stack direction='row' justifyContent='space-between' alignItems='center' width={width || containerWidth}>
            <LlmSwitchButton enabled={!!data?.properties || !!draftLlmValue} />
            <Annotator3DSwitchButton disabled={!roofDelimiter?.polygon && polygons.length !== 1 && screen !== '3d-annotator'} />
          </Stack>
        </Stack>
      )}

      {!data && showFileSource && Object.keys(layer).length > 0 && !draftLlmValue && (
        <Stack direction='row' className='bottom-action'>
          {screen !== '3d-annotator' && (
            <AnalyseRoofButton disabled={polygons.length !== 1} isProcessing={isDetectionProcessing} processDetection={processDetection} />
          )}
          {screen === '3d-annotator' && <Box />}
          <Annotator3DSwitchButton disabled={polygons.length !== 1 && screen !== '3d-annotator'} />
        </Stack>
      )}
      {!isInvoiceForm && screen !== '3d-annotator' && (
        <AnalyseResultButton
          width={width || containerWidth}
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
