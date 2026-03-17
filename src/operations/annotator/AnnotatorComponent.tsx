import { BPLoader } from '@/common/components';
import BpSelect from '@/common/components/BpSelect';
import { useAreaPictureDetailsFetcher, useGeojsonQueryResult, usePolygonMarkerFetcher, useRoofAnalyseQuery } from '@/common/fetcher';
import { useGetElementSize } from '@/common/hooks';
import { annotatorStore, useAnnotatorComponentStore, useAnnotatorScreenSwitch } from '@/common/store';
import { useDialog } from '@/common/store/dialog';
import { getUrlParams, stringCutter, UrlParams, useWrappedSearchParams } from '@/common/utils';
import { ZOOM_LEVEL } from '@/constants/zoom-level';
import { clearPolygons } from '@/providers';
import { AnnotatorCanvas, Polygon } from '@bpartners/annotator-component';
import { AreaPictureMapLayer, ShiftDirection } from '@bpartners/typescript-client';
import { Public as PublicIcon } from '@mui/icons-material';
import { Box, Stack, SxProps, Tooltip, Typography } from '@mui/material';
import { Dispatch, FC, SetStateAction, useEffect } from 'react';
import { degradationLevels } from '../prospects/constants';
import {
  AnalyseResultButton,
  Annotator3D,
  Annotator3DSwitchButton,
  annotatorButtonsActions,
  Disclaimer,
  LlmResult,
  LlmSwitchButton,
  RefocusImageButton,
} from './components';
import { RoofAnalysisDialog } from './components/loading';
import { addressStyle } from './style';
import { AnnotatorComponentProps } from './types';
import {
  AnalyseRoofButton,
  annotatorComponentStyle,
  AnnotatorHelpButton,
  calculateGlobalRate,
  createAnnotationInfoFromRoofAnalyseProperties,
  createDefaultAnnotationInfo,
  getNewPolygonColor,
  measurementMapper,
  shiftPolygons
} from './utils';

const CONVERTER_BASE_URL = process.env.REACT_APP_ANNOTATOR_GEO_CONVERTER_API_URL || '';

export const AnnotatorComponent: FC<AnnotatorComponentProps> = ({
  boxWrapperSx = {},
  showAddress = false,
  showFileSource = true,
  buttonComponent,
  allowAnnotation = true,
  allowSelect = true,
  width,
  height,
  draftAnnotationId,
  isInvoiceForm,
}) => {
  const { address } = useWrappedSearchParams(['address']);
  const { polygonList, setPolygons: setPolygonList } = annotatorStore.usePolygonStore();

  const replaceAnnotations = annotatorStore.useAnnotatorStore(params=> params.replaceAnnotations);
  const resetAnnotations = annotatorStore.useAnnotatorStore(params=> params.resetAnnotations);

  const { geoJsonResultUrl,  llm: draftLlmValue, roofDelimiter, setAreaPictureDetails, setRoofAnalyseProperties } = useAnnotatorComponentStore();
  const { data, isPending } = useGeojsonQueryResult([geoJsonResultUrl], !!geoJsonResultUrl);
  const { data: markerPosition, mutate: mutateMarker } = usePolygonMarkerFetcher();
  const { query: areaPictureDetailsQuery, mutation: areaPictureDetailsMutation } = useAreaPictureDetailsFetcher(() => null);
  const { data: areaPictureDetailsQueried, isLoading: areaPictureDetailsQueryLoading } = areaPictureDetailsQuery;
  const { data: areaPictureDetailsMutated, mutate: mutateAreaPictureDetail, isPending: areaPictureDetailsMutationLoading } = areaPictureDetailsMutation;

  const globalRate = calculateGlobalRate()

  // Get the Area picture details to use
  const currentAreaPictureDetailsToUse = areaPictureDetailsMutated || areaPictureDetailsQueried || { zoom: {} };

  useEffect(() => {
    mutateMarker(currentAreaPictureDetailsToUse)
  }, [currentAreaPictureDetailsToUse])

  useEffect(() => {
    setAreaPictureDetails(currentAreaPictureDetailsToUse);
  }, [JSON.stringify(currentAreaPictureDetailsToUse)]);

  const { filename, isExtended, shiftNb, zoom, actualLayer: layer, otherLayers } = currentAreaPictureDetailsToUse;
  const { level: newZoomLevel, number: newZoomLevelAsNumber } = zoom;
  // Get the Area picture details to use

  const { ref: containerHeightRef, height: containerHeight, width: containerWidth } = useGetElementSize([filename]);
  const { screen } = useAnnotatorScreenSwitch();

  useEffect(() => {
    setRoofAnalyseProperties(data?.properties);

    const currentPolygons = data?.polygons?.slice(1) || [];
    const roofPolygon = data?.polygons?.[0];

    if (polygonList.length === 0 && currentPolygons.length > 0 && data?.properties && data?.image) {
      const roofAnnotationInfo = createAnnotationInfoFromRoofAnalyseProperties(
        roofPolygon.id,
        data?.properties,
        data?.properties?.roof_height_in_meters,
        data?.properties?.roof_slope_in_degrees
      );
      const annotationInfos = data?.polygons?.slice(1).map((polygon, index) => createDefaultAnnotationInfo(polygon, index));
      replaceAnnotations([roofPolygon, ...currentPolygons], [roofAnnotationInfo, ...annotationInfos])
    }
  }, [JSON.stringify(data), isPending]);

  const handleZoomLvl = async (e: any) => {
    const zoomLevel = e.target.value
    mutateAreaPictureDetail({ ...currentAreaPictureDetailsToUse, zoomLevel, zoom: {level: zoomLevel } });
  };

  const handleLayerChanger = async (e: any) => {
    const selectedLayer = otherLayers.find((layer: any) => layer.name === e.target.value);
    mutateAreaPictureDetail({ ...currentAreaPictureDetailsToUse, zoomLevel: newZoomLevel, layerId: selectedLayer.id });
  };

  const refocusImgClick = async () => {
    mutateAreaPictureDetail({ ...currentAreaPictureDetailsToUse,zoomLevel: newZoomLevel,isExtended: !isExtended });
    resetAnnotations()
  };

  const shiftImage = (shift: number, shiftDirection: ShiftDirection) => {
    if (isExtended) {
      mutateAreaPictureDetail({ ...currentAreaPictureDetailsToUse, shiftNb: (shiftDirection !== currentAreaPictureDetailsToUse?.shiftDirection ? 0 : (shiftNb || 0)) + shift, shiftDirection });
      resetAnnotations()
    }
  };



  const handleDetectionProcessingSuccess = () => {
    resetAnnotations()
    clearPolygons(false);
  };

  const { mutate: _processDetection, isPending: isDetectionProcessing } = useRoofAnalyseQuery(
    polygonList || [],
    currentAreaPictureDetailsToUse,
    handleDetectionProcessingSuccess
  );

  const {open: openDialog} = useDialog()
  
  const processDetection = () => {
    openDialog(<RoofAnalysisDialog imageHeight={1024*3} imageWidth={1024*3} imageUrl={UrlParams.get('imgUrl')} polygon={polygonList?.[0]?.points?.slice()}  />, {maxWidth: "lg"}, false)
    _processDetection()
  }

  if (!filename || areaPictureDetailsMutationLoading || areaPictureDetailsQueryLoading || (geoJsonResultUrl && !data?.image)) {
    return <BPLoader sx={{ width: width || undefined }} message="Chargement des données d'annotation..." />;
  }

  const imageSrcFromUrl =
    `${getUrlParams(window.location.search, 'imgUrl')}` +
    // Not necessary for the real image URL,
    // Used to force AnnotatorComponent to refresh
    `&isExtended=${isExtended}` +
    `&zoom=${currentAreaPictureDetailsToUse?.zoom?.number}` +
    `&layer=${currentAreaPictureDetailsToUse?.actualLayer?.id}` + 
    `&shiftNb=${shiftNb}`;

  const setPolygonShifted: Dispatch<SetStateAction<Polygon[]>> = (polygonsOrFunction) => {
    setPolygonList((_polygons) => {
      const polygons: Polygon[] = typeof polygonsOrFunction === 'function' ? polygonsOrFunction(_polygons): polygonsOrFunction
      return data?.properties?.global_rate_type ? polygons : shiftPolygons(polygons, currentAreaPictureDetailsToUse, false)
    })
  }
  
  const polygonListShifted = data?.properties?.global_rate_type ? polygonList : shiftPolygons(polygonList, currentAreaPictureDetailsToUse, true)

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
            <Tooltip title={`${address} | (GPS ${currentAreaPictureDetailsToUse?.geoPositions?.[0]?.latitude}, ${currentAreaPictureDetailsToUse?.geoPositions?.[0]?.longitude}`}>
              <Typography>Adresse: {stringCutter(address, 25)} (GPS {currentAreaPictureDetailsToUse?.geoPositions?.[0]?.latitude}, {currentAreaPictureDetailsToUse?.geoPositions?.[0]?.longitude})</Typography>
            </Tooltip>
          </Stack>
          <AnnotatorHelpButton />
        </Stack>
      )}
      {filename && (
        <Box className='annotator-canvas-container' ref={containerHeightRef}>
          {containerWidth > 0 && screen === 'annotator' && (!geoJsonResultUrl || data?.image) && (
            <AnnotatorCanvas
              markerPosition={!data && (polygonListShifted || []).length === 0 && markerPosition}
              allowAnnotation={allowAnnotation}
              width={width || containerWidth}
              height={height || containerHeight + 50}
              buttonsComponent={buttonComponent ?? annotatorButtonsActions(shiftImage, isExtended, currentAreaPictureDetailsToUse)}
              image={data?.image || imageSrcFromUrl}
              setPolygons={setPolygonShifted}
              polygonList={polygonListShifted}
              measurementMapper={measurementMapper(isExtended)}
              getNewPolygonColor={getNewPolygonColor}
              imagePrecisionLevel={currentAreaPictureDetailsToUse?.actualLayer?.precisionLevelInCm || 5}
              polygonLineSizeProps={{
                imageName: `${filename}.jpg`,
                showLineSize: true,
                converterApiUrl: `${CONVERTER_BASE_URL}`,
                showOnly: true
              }}
              zoom={newZoomLevelAsNumber}
              closeOnNear
            />
          )}
          <Annotator3D
            polygons={polygonList}
            active={screen === '3d-annotator'}
            width={width || containerWidth}
            height={height || containerHeight}
            areaPicture={currentAreaPictureDetailsToUse}
          />
          {(data?.properties || draftLlmValue) && screen === 'llm' && (
            <LlmResult
              width={width || containerWidth}
              height={height || containerHeight}
            />
          )}
        </Box>
      )}


      {filename && (data || data?.properties?.global_rate_type) && (
        <Stack>
          <Disclaimer />
          <Stack direction='row' justifyContent='space-between' alignItems='center'>
            <Box className='global-rage-container'>
              <Typography>Note de dégradation globale : {globalRate.value}%</Typography>
            </Box>
            <Stack className='degratation-levels' direction='row' justifyContent='center' m={1} gap={1}>
              {degradationLevels.map(({ color, label }) => (
                <Box
                  key={label}
                  className={`degratation-levels-box ${(globalRate.type) === label ? 'degratation-levels-box-selected' : ''}`}
                  sx={{
                    bgcolor: color,
                    border: `5px solid ${(globalRate.type) === label ? 'black' : 'transparent'}`,
                  }}
                >
                  {label}
                </Box>
              ))}
            </Stack>
          </Stack>
          <Stack direction='row' justifyContent='space-between' alignItems='center' width={width || containerWidth}>
            <LlmSwitchButton  enabled={!!data?.properties || !!draftLlmValue} />
            <Annotator3DSwitchButton disabled={!roofDelimiter?.polygon && polygonList.length === 0 && screen !== '3d-annotator'} />
          </Stack>
        </Stack>
      )}

      {!data && showFileSource && Object.keys(layer).length > 0 && !draftLlmValue && (
        <Stack direction='row' className='bottom-action'>
          {screen !== '3d-annotator' && (
            <AnalyseRoofButton isProcessing={isDetectionProcessing} processDetection={processDetection} />
          )}
          {screen === '3d-annotator' && <Box />}
          <Annotator3DSwitchButton disabled={polygonList.length !== 1 && screen !== '3d-annotator'} />
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
