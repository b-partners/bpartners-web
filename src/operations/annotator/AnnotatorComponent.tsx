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
import { Dispatch, FC, SetStateAction, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useShallow } from 'zustand/react/shallow';
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
  SaveAnnotationsButton,
  ThreeDMeasureMode,
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
  isAfterAnalyse,
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
  const { data: geojsonResult, isPending } = useGeojsonQueryResult([geoJsonResultUrl], !!geoJsonResultUrl);
  const { data: markerPosition, mutate: mutateMarker } = usePolygonMarkerFetcher();
  const { mutateAreaPictureDetails, currentAreaPictureDetailsToUse, isLoading: areaPictureLoading, rebeginAreaPictureDetails } = useAreaPictureDetailsFetcher();
  const [measureMode, setMeasureMode] = useState<ThreeDMeasureMode>('none');

  useEffect(() => {
    if (currentAreaPictureDetailsToUse && currentAreaPictureDetailsToUse.xTile && currentAreaPictureDetailsToUse.xTile)
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
    setRoofAnalyseProperties(geojsonResult?.properties);

    const currentPolygons = geojsonResult?.polygons?.slice(1) || [];
    const roofPolygon = geojsonResult?.polygons?.[0];

    if (polygonList.length === 0 && currentPolygons.length > 0 && geojsonResult?.properties && geojsonResult?.image) {
      const roofAnnotationInfo = createAnnotationInfoFromRoofAnalyseProperties(
        roofPolygon.id,
        geojsonResult?.properties,
        geojsonResult?.properties?.roof_height_in_meters,
        geojsonResult?.properties?.roof_slope_in_degrees
      );
      const annotationInfos = geojsonResult?.polygons?.slice(1).map((polygon, index) => createDefaultAnnotationInfo(polygon, index));
      replaceAnnotations([roofPolygon, ...currentPolygons], [roofAnnotationInfo, ...annotationInfos]);
    }
  }, [JSON.stringify(geojsonResult), isPending]);

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
  const visibleMeasurementPolygonId = annotatorStore.useAnnotatorStore(useShallow(({ polygonToShowMeasurement }) => polygonToShowMeasurement));

  if (!filename || areaPictureLoading || (geoJsonResultUrl && !geojsonResult?.image)) {
    return <BPLoader sx={{ width: width || undefined }} message='Chargement des données...' />;
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

  const imageSrcFromUrl = refreshImageUrl(getUrlParams(window.location.search, 'imgUrl'), currentAreaPictureDetailsToUse);

  const setPolygonShifted: Dispatch<SetStateAction<Polygon[]>> = polygonsOrFunction => {
    setPolygonList(_polygons => {
      const polygons: Polygon[] = typeof polygonsOrFunction === 'function' ? polygonsOrFunction(_polygons) : polygonsOrFunction;
      return geojsonResult?.properties?.global_rate_type ? polygons : shiftPolygons(polygons, currentAreaPictureDetailsToUse, false);
    });
  };

  const polygonListShifted = isAfterAnalyse(polygonList)
    ? polygonList
    : shiftPolygons(polygonList, currentAreaPictureDetailsToUse, true).map(p => ({
        ...p,
        measurements: p.id !== visibleMeasurementPolygonId ? [] : (p.measurements || []).map(m => ({ ...m, isInvisible: false })),
      }));

  const processDetection = () => {
    openDialog(
      <RoofAnalysisDialog imageHeight={1024 * 3} imageWidth={1024 * 3} imageUrl={UrlParams.get('imgUrl')} polygon={polygonListShifted?.[0]?.points?.slice()} />,
      { maxWidth: 'lg' },
      false
    );
    _processDetection();
  };

  return (
    <Box sx={{ ...annotatorComponentStyle, ...boxWrapperSx } as SxProps}>
      <ImageOptionTopBar areaPictureDetails={currentAreaPictureDetailsToUse} show={allowSelect} mutateAreaPictureDetail={mutateAreaPictureDetails} />
      <AddressTopBar measureMode={measureMode} setMeasureMode={setMeasureMode} areaPictureDetails={currentAreaPictureDetailsToUse} show={showAddress} />

      <Box className='annotator-canvas-container' ref={containerHeightRef}>
        {containerWidth > 0 && screen === 'annotator' && (!geoJsonResultUrl || geojsonResult?.image) && (
          <AnnotatorCanvas
            markerPosition={!geojsonResult && (polygonListShifted || []).length === 0 && markerPosition}
            allowAnnotation={allowAnnotation}
            width={width || containerWidth}
            height={height || containerHeight - 50}
            buttonsComponent={buttonComponent ?? annotatorButtonsActions(shiftImage, isExtended, currentAreaPictureDetailsToUse)}
            image={geojsonResult?.image || imageSrcFromUrl}
            setPolygons={setPolygonShifted}
            polygonList={polygonListShifted}
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
          height={height || containerHeight - 50}
          areaPicture={currentAreaPictureDetailsToUse}
          measureMode={measureMode}
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

      {!geojsonResult && showFileSource && Object.keys(layer).length > 0 && !draftLlmValue && <Stack direction='row' className='bottom-action'></Stack>}
      <AnalyseResultButton
        show={!isInvoiceForm && screen !== '3d-annotator'}
        width={width || containerWidth}
        analyseProperties={geojsonResult?.properties}
        image={geojsonResult?.image}
        isCropped={!!geojsonResult?.image}
        areaPictureDetails={currentAreaPictureDetailsToUse}
        draftAnnotationId={draftAnnotationId}
        rebeginAreaPictureDetails={rebeginAreaPictureDetails}
      />
      {createPortal(
        <SaveAnnotationsButton analyseProperties={geojsonResult?.properties} areaPictureDetails={currentAreaPictureDetailsToUse} />,
        document.getElementById('root')
      )}
    </Box>
  );
};
