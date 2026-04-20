import { AnalyseProperties } from '@/operations/annotator/components';
import { calculateGlobalRate } from '@/operations/annotator/utils';
import { analyseGeneratedIdRef, roofGlobalIdRef } from '@/operations/prospects/constants';
import { annotationsAttributeMapper, annotatorMapper, cache, clearPolygons, getCached } from '@/providers';
import { UrlParams } from '@bpartners/annotator-component';
import { AreaPictureAnnotation, AreaPictureDetails } from '@bpartners/typescript-client';
import { debounce } from '@mui/material';
import _ from 'lodash';
import { useCallback, useEffect } from 'react';
import { useUpdate } from 'react-admin';
import { annotatorStore, useAnnotatorComponentStore } from '../store';

export interface saveAnnotationsParams {
  areaPictureDetails: AreaPictureDetails;
  analyseProperties: AnalyseProperties;
}

export const useSaveAnnotations = (params: saveAnnotationsParams) => {
  const { analyseProperties, areaPictureDetails } = params;
  const [saveAnnotations, { data, isPending, error }] = useUpdate('drafts-annotations');
  const { llm } = useAnnotatorComponentStore();

  const debouncedSave = useCallback(
    debounce((...any: Parameters<typeof saveAnnotations>) => saveAnnotations(...any), 10000),
    []
  );

  useEffect(() => {
    return annotatorStore.useAnnotatorStore.subscribe(params => {
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

      const pictureId = areaPictureDetails.id;
      const annotationId = UrlParams.get('draftAnnotationId');

      const currentData = { polygonList: polygonList.map(p => ({ ...p, measurements: [] as any })), annotationsInfos };

      if (_.isEqual(JSON.parse(getCached.annotationToSave()), currentData)) return;
      cache.annotationToSave(currentData);

      if (polygonList.length === 0) return;

      const annotationAttributeMapped = annotationsAttributeMapper(polygonList, annotationsInfos, pictureId, annotationId);
      const roofDelimiterLongLat = getCached.roofDelimiterLongLatItem();
      const globalRate = calculateGlobalRate();
      const requestBody: AreaPictureAnnotation = {
        ...annotatorMapper(annotationAttributeMapped, pictureId, annotationId, true),
        properties: {
          global_rate_type: globalRate?.type,
          global_rate_value: globalRate?.value,
          roofHeight: analyseProperties?.roof_height_in_meters || annotationsInfos[0]?.height,
          llm: getCached.llmResult() || llm,
          roofDelimiter: roofDelimiterLongLat,
        },
      };

      debouncedSave('drafts-annotations', { data: requestBody, meta: { pictureId, annotationId: annotationId }, id: requestBody.id });
      clearPolygons();
    });
  }, [analyseProperties]);

  return {
    savedAnnotations: data,
    isSaveAnnotationsPending: isPending,
    saveAnnotationsError: error,
  };
};
