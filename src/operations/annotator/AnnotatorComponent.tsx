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
import { Annotator3D, annotatorButtonsActions, LlmResult, ThreeDMeasureMode } from './components';
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
  const { boxWrapperSx = {}, showFileSource = true, buttonComponent, allowAnnotation = true, width, height } = props;

  const { polygonList, setPolygons: setPolygonList } = annotatorStore.usePolygonStore();

  const replaceAnnotations = annotatorStore.useAnnotatorStore(params => params.replaceAnnotations);
  const resetAnnotations = annotatorStore.useAnnotatorStore(params => params.resetAnnotations);

  const { geoJsonResultUrl, llm: draftLlmValue, setRoofAnalyseProperties, areaPictureDetails } = useAnnotatorComponentStore();
  const { data: geojsonResult, isPending } = useGeojsonQueryResult([geoJsonResultUrl], !!geoJsonResultUrl);
  const { data: markerPosition, mutate: mutateMarker } = usePolygonMarkerFetcher();
  const { mutateAreaPictureDetails } = useAreaPictureDetailsFetcher();
  const [measureMode, setMeasureMode] = useState<ThreeDMeasureMode>('none');

  useEffect(() => {
    if (areaPictureDetails && areaPictureDetails.xTile && areaPictureDetails.xTile) mutateMarker(areaPictureDetails);
  }, [areaPictureDetails]);

  const { filename, isExtended, shiftNb, zoom, actualLayer: layer } = areaPictureDetails || {};
  const { number: newZoomLevelAsNumber } = zoom || {};

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

  const visibleMeasurementPolygonId = annotatorStore.useAnnotatorStore(useShallow(({ polygonToShowMeasurement }) => polygonToShowMeasurement));

  const [cachedImageUrl, setCachedImageUrl] = useState<string | null>(null);
  const { fileId } = areaPictureDetails || {};

  useEffect(() => {
    if (!fileId) return;
    getImageFromCache(fileId).then(blob => {
      if (blob) setCachedImageUrl(URL.createObjectURL(blob));
    });
  }, [fileId]);

  if (!filename || (geoJsonResultUrl && !geojsonResult?.image)) {
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
      return geojsonResult?.properties?.global_rate_type ? polygons : shiftPolygons(polygons, areaPictureDetails, false);
    });
  };

  const polygonListShifted = isAfterAnalyse(polygonList)
    ? polygonList
    : shiftPolygons(polygonList, areaPictureDetails, true).map(p => ({
        ...p,
        measurements: p.id !== visibleMeasurementPolygonId ? [] : (p.measurements || []).map(m => ({ ...m, isInvisible: false })),
      }));

  return (
    <Box sx={{ ...annotatorComponentStyle, ...boxWrapperSx } as SxProps}>
      <Box className='annotator-canvas-container' ref={containerHeightRef}>
        {containerWidth > 0 && screen === 'annotator' && (!geoJsonResultUrl || geojsonResult?.image) && (
          <AnnotatorCanvas
            markerPosition={!geojsonResult && (polygonListShifted || []).length === 0 && markerPosition}
            allowAnnotation={allowAnnotation}
            width={width || containerWidth}
            height={height || containerHeight - 50}
            buttonsComponent={buttonComponent ?? annotatorButtonsActions(shiftImage, isExtended, { areaPicture: areaPictureDetails, mutateAreaPictureDetails })}
            image={geojsonResult?.image || cachedImageUrl}
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
