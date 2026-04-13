import { AnalyseProperties } from '@/operations/annotator/components';
import { calculateGlobalRate } from '@/operations/annotator/utils';
import { annotationsAttributeMapper, annotatorMapper, clearPolygons, getCached } from '@/providers';
import { UrlParams } from '@bpartners/annotator-component';
import { AreaPictureAnnotation, AreaPictureDetails } from '@bpartners/typescript-client';
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
    const annotationAttributeMapped = annotationsAttributeMapper(polygonList, annotationsInfos, pictureId, annotationId);
    const roofDelimiterLongLat = getCached.roofDelimiterLongLatItem();
    const globalRate = calculateGlobalRate();
    const requestBody: AreaPictureAnnotation = {
      ...annotatorMapper(annotationAttributeMapped, pictureId, annotationId, true),
      properties: {
        global_rate_type: globalRate?.type,
        global_rate_value: globalRate?.value,
        roofHeight: analyseProperties?.roof_height_in_meters || annotationsInfos[0].height,
        llm: getCached.llmResult() || llm,
        roofDelimiter: roofDelimiterLongLat,
      },
    };
    saveAnnotations('drafts-annotations', { data: { requestBody }, meta: { pictureId, annotationId: annotationId }, id: requestBody.id });
    clearPolygons();
  };

  return {
    saveAnnotations: mutationFn,
    savedAnnotations: data,
    isSaveAnnotationsPending: isPending,
    saveAnnotationsError: error,
  };
};

/**
 * error
 * } catch (e) {
      printError(e);
      notify('resources.annotations.creation.error', { type: 'error' });
    } finally {
      stopLoading();
    }


    redirect 
    if (isDraft) {
      notify('resources.draftsAnnotations.creation.success', { type: 'success' });
      redirect('/prospects?tab=drafts');
      return;
    }
    redirect(
      'list',
      `invoices?imgUrl=${isCropped ? getFileUrl(areaPictureDetails.fileId, 'AREA_PICTURE') : encodeURIComponent(imgUrl)}&pictureId=${pictureId}&annotationId=${annotationIdValue}&showCreateQuote=true`
    );
 */
