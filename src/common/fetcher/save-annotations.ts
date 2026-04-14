import { AnalyseProperties } from '@/operations/annotator/components';
import { calculateGlobalRate } from '@/operations/annotator/utils';
import { annotationsAttributeMapper, annotatorMapper, cache, clearPolygons, getCached } from '@/providers';
import { UrlParams } from '@bpartners/annotator-component';
import { AreaPictureAnnotation, AreaPictureDetails } from '@bpartners/typescript-client';
import { useEffect, useRef } from 'react';
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
  const annotationsInfos = annotatorStore.useAnnotatorInfoStore();
  const { polygonList } = annotatorStore.usePolygonStore();

  const mutationFn = () => {
    const pictureId = areaPictureDetails.id;
    const annotationId = UrlParams.get('draftAnnotationId');

    const currentData = { polygonList, annotationsInfos };

    console.log(currentData, JSON.parse(getCached.annotationToSave()));

    if (getCached.annotationToSave() === JSON.stringify(currentData)) return;
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

    saveAnnotations('drafts-annotations', { data: requestBody, meta: { pictureId, annotationId: annotationId }, id: requestBody.id });
    clearPolygons();
  };

  const intervalRef = useRef(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      mutationFn();
    }, 5000);
    return () => clearInterval(intervalRef.current);
  }, []);

  return {
    saveAnnotations: mutationFn,
    savedAnnotations: data,
    isSaveAnnotationsPending: isPending,
    saveAnnotationsError: error,
  };
};
