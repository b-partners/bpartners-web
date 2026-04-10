import { AnalyseProperties } from '@/operations/annotator/components';
import { calculateGlobalRate } from '@/operations/annotator/utils';
import { annotationsAttributeMapper, annotatorMapper, clearPolygons, getCached } from '@/providers';
import { AreaPictureAnnotation, AreaPictureDetails } from '@bpartners/typescript-client';
import { useUpdate } from 'react-admin';
import { v4 as uuidV4 } from 'uuid';
import { useAnnotatorComponentStore } from '../store';

export const useSaveAnnotations = (
  draftAnnotationId: string,
  polygonList: [],
  annotationsInfo: any,
  areaPictureDetails: AreaPictureDetails,
  analyseProperties: AnalyseProperties
) => {
  const [saveAnnotations] = useUpdate('drafts-annotations');
  const { llm } = useAnnotatorComponentStore();

  const mutationFn = () => {
    const pictureId = areaPictureDetails.id;
    const annotationId = draftAnnotationId || uuidV4();
    const annotationAttributeMapped = annotationsAttributeMapper(polygonList, annotationsInfo, pictureId, annotationId);
    const roofDelimiterLongLat = getCached.roofDelimiterLongLatItem();
    const globalRate = calculateGlobalRate();
    const requestBody: AreaPictureAnnotation = {
      ...annotatorMapper(annotationAttributeMapped, pictureId, annotationId, true),
      properties: {
        global_rate_type: globalRate?.type,
        global_rate_value: globalRate?.value,
        roofHeight: analyseProperties?.roof_height_in_meters || annotationsInfo[0].height,
        llm: getCached.llmResult() || llm,
        roofDelimiter: roofDelimiterLongLat,
      },
    };
    saveAnnotations('drafts-annotations', { data: { requestBody }, meta: { pictureId, annotationId: annotationId }, id: requestBody.id });
    clearPolygons();
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
