import { AreaPictureAnnotation, AreaPictureAnnotationInstance } from '@bpartners/typescript-client';
import { v4 as uuidV4 } from 'uuid';
import { getCached } from '../cache';
import { AnnotationItem } from '@/operations/annotator';

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

export const annotationsAttributeMapper = (annotations: AnnotationItem[], areaPictureId: string, annotationId: string): AreaPictureAnnotationInstance[] => {
  const { userId } = getCached.userInfo();

  return annotations.map(({ annotationInfo, polygon }) => {
    const { labelType, labelName, wear, ...others } = annotationInfo;
    return {
      id: uuidV4(),
      userId,
      labelName,
      labelType,
      annotationId,
      areaPictureId,
      polygon: {
        points: polygon.points,
      },
      metadata: {
        area: polygon.surface,
        wearness: wear,
        fillColor: polygon.fillColor,
        strokeColor: polygon.strokeColor,
        ...others,
      },
    }
  });
};
