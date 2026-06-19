import { BPLoader, LoadingProgressBar } from '@/common/components';
import { useAreaPictureDetailsFetcher, useGeojsonQueryResult, usePolygonMarkerFetcher } from '@/common/fetcher';
import { useGetElementSize } from '@/common/hooks';
import { annotatorStore, useAnnotatorComponentStore, useAnnotatorLoadingStore, useAnnotatorScreenSwitch } from '@/common/store';
import { getImageFromCache } from '@/common/utils';
import { analyseRoofIdRef } from '@/operations/prospects/constants';
import { ANALYSE_VIEW_STORAGE_KEY, ANNOTATOR_VIEW_STORAGE_KEY } from '@/providers';
import { AnnotatorCanvas, Polygon, UrlParams } from '@bpartners/annotator-component';
import { ShiftDirection } from '@bpartners/typescript-client';
import { Box, Stack, SxProps } from '@mui/material';
import { Dispatch, FC, SetStateAction, useEffect, useMemo, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { Annotator3D, annotatorButtonsActions, LlmResult, ThreeDMeasureMode } from './components';
import { RoofAnalysisDialog } from './components/loading';
import { AnnotatorComponentProps } from './types';
import {
  annotatorComponentStyle,
  createAnnotationInfoFromRoofAnalyseProperties,
  createDefaultAnnotationInfo,
  getNewPolygonColor,
  isAfterAnalyse,
  shiftPolygons,
} from './utils';

const CONVERTER_BASE_URL = process.env.REACT_APP_ANNOTATOR_GEO_CONVERTER_API_URL || '';

const ROOF_ANALYSE_PROGRESS_DURATION_MS = 56000;

export const AnnotatorComponent: FC<AnnotatorComponentProps> = props => {
  const { boxWrapperSx = {}, showFileSource = true, buttonComponent, allowAnnotation = true, width, height } = props;

  const { polygonList } = annotatorStore.usePolygonStore();
  const { polygonList: screenPolygonList, setPolygons: setPolygonList } = annotatorStore.useScreenPolygonStore();

  const setScreenAnnotations = annotatorStore.useAnnotatorStore(params => params.setScreenAnnotations);
  const resetAnnotations = annotatorStore.useAnnotatorStore(params => params.resetAnnotations);
  const seedAnalyseRoofFromAnnotator = annotatorStore.useAnnotatorStore(params => params.seedAnalyseRoofFromAnnotator);

  const {
    geoJsonResultUrl,
    llm: draftLlmValue,
    setRoofAnalyseProperties,
    areaPictureDetails,
    analyseImageUrl,
    analyseLoadingPolygon,
  } = useAnnotatorComponentStore();
  const { data: geojsonResult, isPending, isError } = useGeojsonQueryResult([geoJsonResultUrl], !!geoJsonResultUrl);
  const { data: markerPosition, mutate: mutateMarker } = usePolygonMarkerFetcher();
  const { mutateAreaPictureDetails, isLoading } = useAreaPictureDetailsFetcher();
  const [measureMode, setMeasureMode] = useState<ThreeDMeasureMode>('none');

  useEffect(() => {
    if (areaPictureDetails && areaPictureDetails.xTile && areaPictureDetails.xTile) mutateMarker(areaPictureDetails);
  }, [areaPictureDetails]);

  const { filename, isExtended, shiftNb, zoom, actualLayer: layer } = areaPictureDetails || {};
  const { number: newZoomLevelAsNumber } = zoom || {};

  const { ref: containerHeightRef, height: containerHeight, width: containerWidth } = useGetElementSize([filename, areaPictureDetails]);
  const { screen } = useAnnotatorScreenSwitch();
  const setIsAnalyseLoading = useAnnotatorLoadingStore(params => params.setIsAnalyseLoading);

  const isAnalysing = !!analyseLoadingPolygon;
  const isAnalyseResultLoading = !!geoJsonResultUrl && !geojsonResult?.image && !isError;

  useEffect(() => {
    setIsAnalyseLoading(isAnalysing || isAnalyseResultLoading);
  }, [isAnalysing, isAnalyseResultLoading, setIsAnalyseLoading]);

  useEffect(() => {
    if (screen === 'roof-analyse') seedAnalyseRoofFromAnnotator();
  }, [screen, seedAnalyseRoofFromAnnotator]);

  useEffect(() => {
    setRoofAnalyseProperties(geojsonResult?.properties);

    const currentPolygons = geojsonResult?.polygons?.slice(1) || [];
    const detectedRoof = geojsonResult?.polygons?.[0];

    if (!isAfterAnalyse(polygonList) && currentPolygons.length > 0 && geojsonResult?.properties && geojsonResult?.image) {
      const analyseRoofId = `${detectedRoof.id}__${analyseRoofIdRef}`;
      const roofPolygon = { ...detectedRoof, id: analyseRoofId };
      const roofAnnotationInfo = createAnnotationInfoFromRoofAnalyseProperties(
        analyseRoofId,
        geojsonResult?.properties,
        geojsonResult?.properties?.roof_height_in_meters,
        geojsonResult?.properties?.roof_slope_in_degrees
      );
      const annotationInfos = geojsonResult?.polygons?.slice(1).map((polygon, index) => createDefaultAnnotationInfo(polygon, index));
      setScreenAnnotations('roof-analyse', [roofPolygon, ...currentPolygons], [roofAnnotationInfo, ...annotationInfos]);
    }
  }, [JSON.stringify(geojsonResult), isPending]);

  const visibleMeasurementPolygonId = annotatorStore.useAnnotatorStore(useShallow(({ polygonToShowMeasurement }) => polygonToShowMeasurement));

  const [cachedImageUrl, setCachedImageUrl] = useState<string | null>(null);
  const { fileId } = areaPictureDetails || {};

  useEffect(() => {
    if (!fileId) return;
    getImageFromCache(fileId).then(blob => {
      if (blob) setCachedImageUrl(URL.createObjectURL(blob));
    });
  }, [areaPictureDetails]);

  const polygonListShifted = useMemo(
    () =>
      isAfterAnalyse(screenPolygonList)
        ? screenPolygonList
        : shiftPolygons(screenPolygonList, areaPictureDetails, true).map(p => ({
            ...p,
            measurements: p.id !== visibleMeasurementPolygonId ? [] : (p.measurements || []).map(m => ({ ...m, isInvisible: false })),
          })),
    [screenPolygonList, areaPictureDetails, visibleMeasurementPolygonId]
  );

  if (!filename) {
    return <BPLoader sx={{ width: '100%' }} message='Chargement des données...' />;
  }

  const shiftImage = (shift: number, shiftDirection: ShiftDirection) => {
    if (isExtended) {
      mutateAreaPictureDetails({
        ...areaPictureDetails,
        shiftNb: (shiftDirection !== areaPictureDetails?.shiftDirection ? 0 : shiftNb || 0) + shift,
        shiftDirection,
      });
      resetAnnotations();
    }
  };

  const setPolygonShifted: Dispatch<SetStateAction<Polygon[]>> = polygonsOrFunction => {
    setPolygonList(_polygons => {
      const polygons: Polygon[] = typeof polygonsOrFunction === 'function' ? polygonsOrFunction(_polygons) : polygonsOrFunction;
      return isAfterAnalyse(polygons) ? polygons : shiftPolygons(polygons, areaPictureDetails, false);
    });
  };

  if (isLoading) return <BPLoader message='Chargement des données...' />;

  const isAnalyseScreen = screen === 'roof-analyse';
  const isAnalysingOnScreen = isAnalyseScreen && isAnalysing;
  const showAnnotatorCanvas = !isAnalysingOnScreen && (screen === 'annotator' || (isAnalyseScreen && !isAnalyseResultLoading));
  const canvasImage = isAnalyseScreen ? analyseImageUrl || geojsonResult?.image || cachedImageUrl : cachedImageUrl;

  return (
    <Box sx={{ ...annotatorComponentStyle, ...boxWrapperSx } as SxProps}>
      <Box className='annotator-canvas-container' ref={containerHeightRef}>
        {isAnalysing && (
          <Box className={`analyse-loading-container ${isAnalyseScreen ? '' : 'analyse-loading-hidden'}`}>
            <RoofAnalysisDialog
              imageUrl={cachedImageUrl || UrlParams.get('imgUrl')}
              imageWidth={1024 * 3}
              imageHeight={1024 * 3}
              polygon={analyseLoadingPolygon}
            />
          </Box>
        )}
        {isAnalyseScreen && isAnalyseResultLoading && (
          <Box className='analyse-loading-container'>
            <BPLoader sx={{ width: '100%' }} message='Chargement des données...' />
          </Box>
        )}
        <LoadingProgressBar
          className='analyse-progress'
          durationMs={ROOF_ANALYSE_PROGRESS_DURATION_MS}
          isLoading={isAnalyseScreen && (isAnalysing || isAnalyseResultLoading)}
        />
        {showAnnotatorCanvas && (
          <AnnotatorCanvas
            markerPosition={!geojsonResult && (polygonListShifted || []).length === 0 && markerPosition}
            allowAnnotation={allowAnnotation}
            width={width || containerWidth}
            height={height || containerHeight - 50}
            buttonsComponent={buttonComponent ?? annotatorButtonsActions(shiftImage, isExtended, { areaPicture: areaPictureDetails, mutateAreaPictureDetails })}
            image={canvasImage}
            setPolygons={setPolygonShifted}
            polygonList={polygonListShifted}
            getNewPolygonColor={getNewPolygonColor}
            imagePrecisionLevel={areaPictureDetails?.actualLayer?.precisionLevelInCm || 5}
            polygonLineSizeProps={{
              imageName: `${filename}.jpg`,
              showLineSize: true,
              converterApiUrl: `${CONVERTER_BASE_URL}`,
              showOnly: true,
            }}
            zoom={newZoomLevelAsNumber}
            key={isAnalyseScreen ? ANALYSE_VIEW_STORAGE_KEY : ANNOTATOR_VIEW_STORAGE_KEY}
            storageKey={isAnalyseScreen ? ANALYSE_VIEW_STORAGE_KEY : ANNOTATOR_VIEW_STORAGE_KEY}
            closeOnNear
          />
        )}
        <Annotator3D
          polygons={polygonList}
          active={screen === '3d-annotator'}
          width={width || containerWidth}
          height={height || containerHeight}
          areaPicture={areaPictureDetails}
          measureMode={measureMode}
          setMeasureMode={setMeasureMode}
        />
        {screen === 'llm' && <LlmResult width={width || containerWidth} height={height || containerHeight} />}
      </Box>

      {!geojsonResult && showFileSource && Object.keys(layer).length > 0 && !draftLlmValue && <Stack direction='row' className='bottom-action'></Stack>}
    </Box>
  );
};
