import { BPLoader } from '@/common/components';
import { useAreaPictureDetailsFetcher, useGeojsonQueryResult, usePolygonMarkerFetcher, useRoofAnalyseQuery } from '@/common/fetcher';
import { useGetElementSize } from '@/common/hooks';
import { annotatorStore, useAnnotatorComponentStore, useAnnotatorScreenSwitch } from '@/common/store';
import { useDialog } from '@/common/store/dialog';
import { getUrlParams, UrlParams } from '@/common/utils';
import { clearPolygons } from '@/providers';
import { AnnotatorCanvas, Polygon } from '@bpartners/annotator-component';
import { ShiftDirection } from '@bpartners/typescript-client';
import { Box, Stack, SxProps, Typography } from '@mui/material';
import { Dispatch, FC, SetStateAction, useEffect } from 'react';
import { degradationLevels } from '../prospects/constants';
import {
  AddressTopBar,
  AnalyseResultButton,
  Annotator3D,
  Annotator3DSwitchButton,
  annotatorButtonsActions,
  Disclaimer,
  ImageOptionTopBar,
  LlmResult,
  LlmSwitchButton,
} from './components';
import { RoofAnalysisDialog } from './components/loading';
import { AnnotatorComponentProps } from './types';
import {
  AnalyseRoofButton,
  annotatorComponentStyle,
  calculateGlobalRate,
  createAnnotationInfoFromRoofAnalyseProperties,
  createDefaultAnnotationInfo,
  getNewPolygonColor,
  measurementMapper,
  refreshImageUrl,
  shiftPolygons,
} from './utils';

const CONVERTER_BASE_URL = process.env.REACT_APP_ANNOTATOR_GEO_CONVERTER_API_URL || '';

export const AnnotatorComponent: FC<AnnotatorComponentProps> = props => {
  const {
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
  } = props;

  const { polygonList, setPolygons: setPolygonList } = annotatorStore.usePolygonStore();

  const replaceAnnotations = annotatorStore.useAnnotatorStore(params => params.replaceAnnotations);
  const resetAnnotations = annotatorStore.useAnnotatorStore(params => params.resetAnnotations);

  const { geoJsonResultUrl, llm: draftLlmValue, roofDelimiter, setAreaPictureDetails, setRoofAnalyseProperties } = useAnnotatorComponentStore();
  const { data, isPending } = useGeojsonQueryResult([geoJsonResultUrl], !!geoJsonResultUrl);
  const { data: markerPosition, mutate: mutateMarker } = usePolygonMarkerFetcher();
  const { mutateAreaPictureDetails, currentAreaPictureDetailsToUse, isLoading: areaPictureLoading } = useAreaPictureDetailsFetcher();

  useEffect(() => {
    mutateMarker(currentAreaPictureDetailsToUse);
  }, [currentAreaPictureDetailsToUse]);

  useEffect(() => {
    setAreaPictureDetails(currentAreaPictureDetailsToUse);
  }, [JSON.stringify(currentAreaPictureDetailsToUse)]);

  const { filename, isExtended, shiftNb, zoom, actualLayer: layer } = currentAreaPictureDetailsToUse;
  const { number: newZoomLevelAsNumber } = zoom;

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
      replaceAnnotations([roofPolygon, ...currentPolygons], [roofAnnotationInfo, ...annotationInfos]);
    }
  }, [JSON.stringify(data), isPending]);

  const handleDetectionProcessingSuccess = () => {
    resetAnnotations();
    clearPolygons(false);
  };

  const { mutate: _processDetection, isPending: isDetectionProcessing } = useRoofAnalyseQuery(
    polygonList || [],
    currentAreaPictureDetailsToUse,
    handleDetectionProcessingSuccess
  );

  const { open: openDialog } = useDialog();

  if (!filename || areaPictureLoading || areaPictureLoading || (geoJsonResultUrl && !data?.image)) {
    return <BPLoader sx={{ width: width || undefined }} message="Chargement des données d'annotation..." />;
  }

  const globalRate = calculateGlobalRate();

  const shiftImage = (shift: number, shiftDirection: ShiftDirection) => {
    if (isExtended) {
      mutateAreaPictureDetails({
        ...currentAreaPictureDetailsToUse,
        shiftNb: (shiftDirection !== currentAreaPictureDetailsToUse?.shiftDirection ? 0 : shiftNb || 0) + shift,
        shiftDirection,
      });
      resetAnnotations();
    }
  };

  const processDetection = () => {
    openDialog(
      <RoofAnalysisDialog imageHeight={1024 * 3} imageWidth={1024 * 3} imageUrl={UrlParams.get('imgUrl')} polygon={polygonList?.[0]?.points?.slice()} />,
      { maxWidth: 'lg' },
      false
    );
    _processDetection();
  };

  const imageSrcFromUrl = refreshImageUrl(getUrlParams(window.location.search, 'imgUrl'), currentAreaPictureDetailsToUse);

  const setPolygonShifted: Dispatch<SetStateAction<Polygon[]>> = polygonsOrFunction => {
    setPolygonList(_polygons => {
      const polygons: Polygon[] = typeof polygonsOrFunction === 'function' ? polygonsOrFunction(_polygons) : polygonsOrFunction;
      return data?.properties?.global_rate_type ? polygons : shiftPolygons(polygons, currentAreaPictureDetailsToUse, false);
    });
  };

  const polygonListShifted = data?.properties?.global_rate_type ? polygonList : shiftPolygons(polygonList, currentAreaPictureDetailsToUse, true);

  return (
    <Box sx={{ ...annotatorComponentStyle, ...boxWrapperSx } as SxProps}>
      <ImageOptionTopBar areaPictureDetails={currentAreaPictureDetailsToUse} show={allowSelect} mutateAreaPictureDetail={mutateAreaPictureDetails} />
      <AddressTopBar areaPictureDetails={currentAreaPictureDetailsToUse} show={showAddress} />

      <Box className='annotator-canvas-container' ref={containerHeightRef}>
        {containerWidth > 0 && screen === 'annotator' && (!geoJsonResultUrl || data?.image) && (
          <AnnotatorCanvas
            markerPosition={!data && (polygonListShifted || []).length === 0 && markerPosition}
            allowAnnotation={allowAnnotation}
            width={width || containerWidth}
            height={height || containerHeight - 50}
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
              showOnly: true,
            }}
            zoom={newZoomLevelAsNumber}
            closeOnNear
          />
        )}
        <Annotator3D
          polygons={polygonList}
          active={screen === '3d-annotator'}
          width={width || containerWidth}
          height={height || containerHeight - 136}
          areaPicture={currentAreaPictureDetailsToUse}
        />
        {screen === 'llm' && <LlmResult width={width || containerWidth} height={height || containerHeight} />}
      </Box>

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
        </Stack>
        <Stack direction='row' justifyContent='space-between' alignItems='center' width={width || containerWidth}>
          <AnalyseRoofButton isProcessing={isDetectionProcessing} processDetection={processDetection} />
          <LlmSwitchButton />
          <Annotator3DSwitchButton disabled={!roofDelimiter?.polygon && polygonList.length === 0 && screen !== '3d-annotator'} />
        </Stack>
      </Stack>

      {!data && showFileSource && Object.keys(layer).length > 0 && !draftLlmValue && <Stack direction='row' className='bottom-action'></Stack>}
      <AnalyseResultButton
        show={!isInvoiceForm && screen !== '3d-annotator'}
        width={width || containerWidth}
        analyseProperties={data?.properties}
        image={data?.image}
        isCropped={!!data?.image}
        areaPictureDetails={currentAreaPictureDetailsToUse}
        draftAnnotationId={draftAnnotationId}
      />
    </Box>
  );
};
