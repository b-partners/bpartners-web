import { Polygon } from '@bpartners/annotator-component';
import { AreaPictureAnnotation, AreaPictureAnnotationInstance } from '@bpartners/typescript-client';
import { AnnotationInfo } from 'src/operations/annotator';
import { v4 as uuidV4 } from 'uuid';
import { getCached } from '../cache';

export const annotatorMapper = (annotationAttributeMapped: AreaPictureAnnotationInstance[], pictureId: string, annotationId: string): AreaPictureAnnotation => {
  const currentDate = new Date();

  return {
    id: annotationId,
    idAreaPicture: pictureId,
    creationDatetime: currentDate,
    annotations: annotationAttributeMapped,
  };
};

export const annotationsAttributeMapper = (data: any, polygons: Polygon[], pictureId: string, annotationId: string) => {
  const { userId } = getCached.userInfo();

  return Object.entries<any>(data).map(([index, attributes]) => {
    const polygonIndex = parseInt(index, 10);
    const correspondingPolygon = polygons[polygonIndex];

    const { labelType, labelName, wear, ...others } = attributes as AnnotationInfo;

    return {
      id: uuidV4(),
      areaPictureId: pictureId,
      annotationId: annotationId,
      metadata: {
        area: correspondingPolygon.surface,
        wearness: wear,
        ...others,
      },
      userId: userId,
      labelName,
      labelType,
      polygon: {
        points: correspondingPolygon.points,
      },
    } as AreaPictureAnnotationInstance;
  });
};
