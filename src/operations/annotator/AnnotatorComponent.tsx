import { BPLoader } from '@/common/components';
import { useAreaPictureDetailsFetcher, useGeojsonQueryResult, usePolygonMarkerFetcher, useSaveAnnotations } from '@/common/fetcher';
import { useGetElementSize } from '@/common/hooks';
import { annotatorStore, useAnnotatorComponentStore, useAnnotatorScreenSwitch } from '@/common/store';
import { getUrlParams } from '@/common/utils';
import { AnnotatorCanvas, Polygon } from '@bpartners/annotator-component';
import { ShiftDirection } from '@bpartners/typescript-client';
import { Box, Stack, SxProps } from '@mui/material';
import { Dispatch, FC, SetStateAction, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useShallow } from 'zustand/react/shallow';
import {
  Annotator3D,
  Annotator3DRegenerateButton,
  Annotator3DSaveButton,
  annotatorButtonsActions,
  Disclaimer,
  LlmResult,
  SaveAnnotationsNotification,
  ThreeDMeasureMode,
} from './components';
import { AnnotatorComponentProps } from './types';
import {
  annotatorComponentStyle,
  createAnnotationInfoFromRoofAnalyseProperties,
  createDefaultAnnotationInfo,
  getNewPolygonColor,
  isAfterAnalyse,
  refreshImageUrl,
  shiftPolygons,
} from './utils';

const CONVERTER_BASE_URL = process.env.REACT_APP_ANNOTATOR_GEO_CONVERTER_API_URL || '';

export const AnnotatorComponent: FC<AnnotatorComponentProps> = props => {
  const { boxWrapperSx = {}, showFileSource = true, buttonComponent, allowAnnotation = true, width, height } = props;

  const { polygonList, setPolygons: setPolygonList } = annotatorStore.usePolygonStore();

  const replaceAnnotations = annotatorStore.useAnnotatorStore(params => params.replaceAnnotations);
  const resetAnnotations = annotatorStore.useAnnotatorStore(params => params.resetAnnotations);

  const { geoJsonResultUrl, llm: draftLlmValue, setAreaPictureDetails, setRoofAnalyseProperties } = useAnnotatorComponentStore();
  const { data: geojsonResult, isPending } = useGeojsonQueryResult([geoJsonResultUrl], !!geoJsonResultUrl);
  const { data: markerPosition, mutate: mutateMarker } = usePolygonMarkerFetcher();
  const { mutateAreaPictureDetails, currentAreaPictureDetailsToUse, isLoading: areaPictureLoading } = useAreaPictureDetailsFetcher();
  const [measureMode, setMeasureMode] = useState<ThreeDMeasureMode>('none');

  const { isSaveAnnotationsPending, saveAnnotationsError, savedAnnotations, triggerManualSave } = useSaveAnnotations({
    analyseProperties: geojsonResult?.properties,
    areaPictureDetails: currentAreaPictureDetailsToUse,
  });

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

  const visibleMeasurementPolygonId = annotatorStore.useAnnotatorStore(useShallow(({ polygonToShowMeasurement }) => polygonToShowMeasurement));

  if (!filename || areaPictureLoading || (geoJsonResultUrl && !geojsonResult?.image)) {
    return <BPLoader sx={{ width: width || undefined }} message='Chargement des données...' />;
  }

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

  return (
    <Box sx={{ ...annotatorComponentStyle, ...boxWrapperSx } as SxProps}>
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
          setMeasureMode={setMeasureMode}
        />
        {screen === 'llm' && <LlmResult width={width || containerWidth} height={height || containerHeight} />}
      </Box>

      <Stack>
        <Disclaimer />
        <Stack direction='row' justifyContent='space-between' alignItems='center' width={width || containerWidth}>
          <Annotator3DRegenerateButton />
          <Annotator3DSaveButton onSave={triggerManualSave} isSaving={isSaveAnnotationsPending} />
        </Stack>
      </Stack>

      {!geojsonResult && showFileSource && Object.keys(layer).length > 0 && !draftLlmValue && <Stack direction='row' className='bottom-action'></Stack>}
      {createPortal(
        <SaveAnnotationsNotification
          isSaveAnnotationsPending={isSaveAnnotationsPending}
          saveAnnotationsError={saveAnnotationsError}
          savedAnnotations={savedAnnotations}
        />,
        document.getElementById('root')
      )}
    </Box>
  );
};
