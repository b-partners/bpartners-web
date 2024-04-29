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
  // mettre ici le vrai type depuis notre client
  const { userId } = getCached.userInfo();

  return Object.entries<any>(data).map(([index, attributes]) => {
    // * <AreaPictureAnnotationInstanceMetadata>
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
        wearLevel: 3, //attributes.wearLevel // TODO : voit avec Sofiane si c'est un champ number, et quelle est la limite
      },
      userId: userId,
      labelName: attributes.labelType, // * ceci devras être le name du label genre "polygon A" mais ce que le client a écrit
      labelType: attributes.labelType,
      polygon: {
        points: correspondingPolygon.points,
      },
    };
  });
};
