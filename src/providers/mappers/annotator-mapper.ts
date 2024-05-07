import { Polygon } from '@bpartners/annotator-component';
import { AreaPictureAnnotation, AreaPictureAnnotationInstance } from '@bpartners/typescript-client';
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

    return {
      id: uuidV4(),
      areaPictureId: pictureId,
      annotationId: annotationId,
      metadata: {
        area: correspondingPolygon.surface,
        slope: attributes.slope,
        covering: attributes.covering,
        wearLevel: attributes.wearLevel,
        obstacle: attributes.obstacle,
        comment: attributes.comment,
        fillColor: attributes.fillColor,
        strokeColor: attributes.strokeColor,
      },
      userId: userId,
      labelName: attributes.labelName,
      labelType: attributes.labelType,
      polygon: {
        points: correspondingPolygon.points,
      },
    };
  });
};
