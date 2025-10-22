import { AnnotationInfo } from '@/operations/annotator';
import { Polygon } from '@bpartners/annotator-component';
import { AreaPictureAnnotation, AreaPictureAnnotationInstance, Wearness } from '@bpartners/typescript-client';
import { getCached } from '../cache';

export const annotatorMapper = (
  annotationAttributeMapped: AreaPictureAnnotationInstance[],
  pictureId: string,
  annotationId: string,
  isDraft: boolean
): AreaPictureAnnotation => {
  const currentDate = new Date();

  return {
    id: annotationId,
    idAreaPicture: pictureId,
    creationDatetime: currentDate,
    annotations: annotationAttributeMapped,
    isDraft,
  };
};

export const annotationsAttributeMapper = (
  polygons: Polygon[],
  annotationInfos: AnnotationInfo[],
  areaPictureId: string,
  annotationId: string
): AreaPictureAnnotationInstance[] => {
  const { userId } = getCached.userInfo();

  return polygons.map(polygon => {
    const annotationInfo = annotationInfos.find(info => info.polygonId === polygon.id);

    if (!annotationInfo) {
      throw new Error('Annotation info is missing for this polygon');
    }

    const { labelType, labelName, wear, ...others } = annotationInfo;
    const wearness = (wear as Wearness | '') === '' ? null : wear;

    return {
      id: polygon.id,
      userId,
      labelName,
      labelType,
      annotationId,
      areaPictureId,
      polygon: {
        points: polygon.points,
      },
      metadata: {
        ...others,
        area: polygon.surface,
        wearness,
        fillColor: polygon.fillColor,
        strokeColor: polygon.strokeColor,
      },
    };
  });
};
