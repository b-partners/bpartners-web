import { AnalyseProperties } from '@/operations/annotator/components';
import { calculateGlobalRate } from '@/operations/annotator/utils';
import { analyseGeneratedIdRef, roofGlobalIdRef } from '@/operations/prospects/constants';
import { annotationsAttributeMapper, annotatorMapper, cache, clearPolygons, getCached } from '@/providers';
import { UrlParams } from '@bpartners/annotator-component';
import { AreaPictureAnnotation, AreaPictureDetails } from '@bpartners/typescript-client';
import { debounce } from '@mui/material';
import _ from 'lodash';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useUpdate } from 'react-admin';
import { annotatorStore, roof3DStore, useAnnotatorComponentStore } from '../store';

export interface saveAnnotationsParams {
  areaPictureDetails: AreaPictureDetails;
  analyseProperties: AnalyseProperties;
}

const getThreeDMapping = () =>
  JSON.stringify({
    panNames: roof3DStore.useRoof3DStore.getState().panNames,
    edgeTypes: roof3DStore.useRoof3DStore.getState().edgeTypes,
    savedPolygons: roof3DStore.useRoof3DStore.getState().savedPolygons,
    savedLines: roof3DStore.useRoof3DStore.getState().savedLines,
  });

const buildRequestBody = (pictureId: string, analyseProperties: AnalyseProperties, llm: any): AreaPictureAnnotation | null => {
  const annotatorState = annotatorStore.useAnnotatorStore.getState();
  const annotationsInfos = Object.values(annotatorState.annotations).map(a => a.annotationInfos);
  const polygonList = Object.values(annotatorState.annotations).map(a => a.polygon);
  if (polygonList.length === 0) return null;

  const annotationId = UrlParams.get('draftAnnotationId');
  const annotationAttributeMapped = annotationsAttributeMapper(polygonList, annotationsInfos, pictureId, annotationId);
  const roofDelimiterLongLat = getCached.roofDelimiterLongLatItem();
  const globalRate = calculateGlobalRate();

  return {
    ...annotatorMapper(annotationAttributeMapped, pictureId, annotationId, true),
    properties: {
      global_rate_type: globalRate?.type,
      global_rate_value: globalRate?.value,
      roofHeight: analyseProperties?.roof_height_in_meters || annotationsInfos[0]?.height,
      llm: getCached.llmResult() || llm,
      roofDelimiter: roofDelimiterLongLat,
      threeDGenerationMode: annotatorState.threeDFromSegmentation,
      threeDGenerationId: annotatorState.threeDGenerationId,
      threeDMapping: getThreeDMapping(),
    },
  };
};

const saveDraftAnnotation = (requestBody: AreaPictureAnnotation, save: (...args: any[]) => void) => {
  const pictureId = requestBody.properties?.pictureId ?? requestBody.id;
  const annotationId = UrlParams.get('draftAnnotationId');
  save('drafts-annotations', { data: requestBody, meta: { pictureId, annotationId }, id: requestBody.id });
  clearPolygons();
};

export const useSaveAnnotations = (params: saveAnnotationsParams) => {
  const { analyseProperties, areaPictureDetails } = params;
  const [saveAnnotations, { data, isPending, error }] = useUpdate('drafts-annotations');
  const { llm } = useAnnotatorComponentStore();

  const lastSavedThreeDGenerationIdRef = useRef<string | undefined>(undefined);

  const debouncedSave = useCallback(
    debounce((...any: Parameters<typeof saveAnnotations>) => saveAnnotations(...any), 10000),
    []
  );

  // Auto-save draft when 2D annotations change (polygons, labels, etc.)
  useEffect(() => {
    return annotatorStore.useAnnotatorStore.subscribe(params => {
      const pictureId = areaPictureDetails.id;
      if (!pictureId) return;
      let isSecond = false;
      const annotationsInfos = Object.values(params.annotations).map(a => a.annotationInfos);
      const polygonList = Object.values(params.annotations).map(a => {
        const currentPolygon = a.polygon;
        if ((currentPolygon.id.includes(analyseGeneratedIdRef) && !currentPolygon.id.includes(roofGlobalIdRef)) || currentPolygon.isInvisible || isSecond) {
          currentPolygon.measurements = currentPolygon?.measurements?.map(m => ({ ...m, isInvisible: true }));
        } else {
          isSecond = true;
          currentPolygon.measurements = currentPolygon?.measurements?.map(m => ({ ...m, isInvisible: false }));
        }
        return currentPolygon;
      });

      const currentData = { polygonList: polygonList.map(p => ({ ...p, measurements: [] as any })), annotationsInfos };

      if (_.isEqual(JSON.parse(getCached.annotationToSave()), currentData)) return;
      cache.annotationToSave(currentData);

      const requestBody = buildRequestBody(pictureId, analyseProperties, llm);
      if (!requestBody) return;

      const currentThreeDGenerationId = annotatorStore.useAnnotatorStore.getState().threeDGenerationId;
      const threeDGenerationIdChanged = currentThreeDGenerationId && currentThreeDGenerationId !== lastSavedThreeDGenerationIdRef.current;

      if (threeDGenerationIdChanged) {
        lastSavedThreeDGenerationIdRef.current = currentThreeDGenerationId;
        saveDraftAnnotation(requestBody, saveAnnotations);
      } else {
        saveDraftAnnotation(requestBody, debouncedSave);
      }
    });
  }, [
    analyseProperties,
    annotatorStore.useAnnotatorStore.getState().threeDGenerationId,
    annotatorStore.useAnnotatorStore.getState().threeDFromSegmentation,
    !!areaPictureDetails,
    roof3DStore.useRoof3DStore.getState().roofSurfaces,
    roof3DStore.useRoof3DStore.getState().panNames,
    roof3DStore.useRoof3DStore.getState().savedLines,
    roof3DStore.useRoof3DStore.getState().savedPolygons,
  ]);

  // Auto-save draft when 3D sidebar mapping changes (pan names, edge types, measurements)
  useEffect(() => {
    let prev = getThreeDMapping();

    return roof3DStore.useRoof3DStore.subscribe(() => {
      const current = getThreeDMapping();
      if (current === prev) return;
      prev = current;

      const pictureId = areaPictureDetails?.id;
      if (!pictureId) return;

      const requestBody = buildRequestBody(pictureId, analyseProperties, llm);
      if (!requestBody) return;

      saveDraftAnnotation(requestBody, debouncedSave);
    });
  }, [
    !!areaPictureDetails,
    analyseProperties,
    annotatorStore.useAnnotatorStore.getState().threeDFromSegmentation,
    annotatorStore.useAnnotatorStore.getState().threeDGenerationId,
    roof3DStore.useRoof3DStore.getState().roofSurfaces,
    roof3DStore.useRoof3DStore.getState().panNames,
    roof3DStore.useRoof3DStore.getState().savedLines,
    roof3DStore.useRoof3DStore.getState().savedPolygons,
  ]);

  const triggerManualSave = useMemo(
    () => () => {
      const pictureId = areaPictureDetails?.id;
      if (!pictureId) return;
      const requestBody = buildRequestBody(pictureId, analyseProperties, llm);
      if (!requestBody) return;
      saveDraftAnnotation(requestBody, saveAnnotations);
    },
    [areaPictureDetails?.id, analyseProperties, llm, saveAnnotations]
  );

  return {
    savedAnnotations: data,
    isSaveAnnotationsPending: isPending,
    saveAnnotationsError: error,
    triggerManualSave,
  };
};
