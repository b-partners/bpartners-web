import { BPLoader } from '@/common/components';
import { useAreaPictureDetailsFetcher, useGeojsonQueryResult, usePolygonMarkerFetcher } from '@/common/fetcher';
import { useGetElementSize } from '@/common/hooks';
import { annotatorStore, useAnnotatorComponentStore, useAnnotatorScreenSwitch } from '@/common/store';
import { getImageFromCache } from '@/common/utils';
import { AnnotatorCanvas, Polygon } from '@bpartners/annotator-component';
import { ShiftDirection } from '@bpartners/typescript-client';
import { Box, Stack, SxProps } from '@mui/material';
import { Dispatch, FC, SetStateAction, useEffect, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { Annotator3D, annotatorButtonsActions, LlmResult, RoofAnalyseRunButton, ThreeDMeasureMode } from './components';
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

export const AnnotatorComponent: FC<AnnotatorComponentProps> = props => {
  const { boxWrapperSx = {}, showFileSource = true, buttonComponent, allowAnnotation = true, width, height, showAddress } = props;

  const { polygonList } = annotatorStore.usePolygonStore();
  const { polygonList: screenPolygonList, setPolygons: setPolygonList } = annotatorStore.useScreenPolygonStore();

  const setScreenAnnotations = annotatorStore.useAnnotatorStore(params => params.setScreenAnnotations);
  const resetAnnotations = annotatorStore.useAnnotatorStore(params => params.resetAnnotations);

  const { geoJsonResultUrl, llm: draftLlmValue, setRoofAnalyseProperties, areaPictureDetails, analyseImageUrl } = useAnnotatorComponentStore();
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

  useEffect(() => {
    setRoofAnalyseProperties(geojsonResult?.properties);

    const currentPolygons = geojsonResult?.polygons?.slice(1) || [];
    const roofPolygon = geojsonResult?.polygons?.[0];

    if (!isAfterAnalyse(polygonList) && currentPolygons.length > 0 && geojsonResult?.properties && geojsonResult?.image) {
      const roofAnnotationInfo = createAnnotationInfoFromRoofAnalyseProperties(
        roofPolygon.id,
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

  if (!filename || (geoJsonResultUrl && !geojsonResult?.image && !isError)) {
    return <BPLoader sx={{ width: width || undefined }} message='Chargement des données...' />;
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

  const polygonListShifted = isAfterAnalyse(screenPolygonList)
    ? screenPolygonList
    : shiftPolygons(screenPolygonList, areaPictureDetails, true).map(p => ({
        ...p,
        measurements: p.id !== visibleMeasurementPolygonId ? [] : (p.measurements || []).map(m => ({ ...m, isInvisible: false })),
      }));

  if (isLoading) return <BPLoader message='Chargement des données...' />;

  const isAnalyseScreen = screen === 'roof-analyse';
  const canvasImage = isAnalyseScreen ? analyseImageUrl || geojsonResult?.image || cachedImageUrl : cachedImageUrl;

  return (
    <Box sx={{ ...annotatorComponentStyle, ...boxWrapperSx } as SxProps}>
      <Box className='annotator-canvas-container' ref={containerHeightRef}>
        {isAnalyseScreen && showAddress && <RoofAnalyseRunButton />}
        {(screen === 'annotator' || isAnalyseScreen) && (!geoJsonResultUrl || geojsonResult?.image || isAnalyseScreen) && (
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
            closeOnNear
          />
        )}
        <Annotator3D
          polygons={screenPolygonList}
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
