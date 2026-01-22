import { AnnotationInfo } from '@/operations/annotator';
import { Point, Polygon } from '@bpartners/annotator-component';
import { AreaPictureAnnotation } from '@bpartners/typescript-client';

export const areaPictureAnnotationToPolygonAndAreaPictureInfo = (areaPictureAnnotation: AreaPictureAnnotation) => {
  const polygons: Polygon[] = [];
  const annotationsInfos: AnnotationInfo[] = [];

  areaPictureAnnotation.annotations.forEach(annotation => {
    const polygon: Polygon = {
      fillColor: annotation.metadata.fillColor,
      strokeColor: annotation.metadata.strokeColor,
      id: annotation.id,
      points: (annotation.polygon.points || []) as Point[],
    };

    const annotationInfos: AnnotationInfo = {
      area: annotation.metadata.area,
      comment: annotation.metadata.comment,
      covering: annotation.metadata.covering as any,
      covering2: (annotation.metadata as any).covering2 as any,
      fillColor: annotation.metadata.fillColor,
      height: annotation.metadata.height,
      labelName: annotation.labelName,
      labelType: annotation.labelType as any,
      humidityLevel: annotation.metadata.humidityLevel,
      moldRate: annotation.metadata.moldRate,
      obstacle: annotation.metadata.obstacle,
      slope: annotation.metadata.slope,
      strokeColor: annotation.metadata.strokeColor,
      wear: (annotation.metadata as any).wear,
      wearLevel: annotation.metadata.wearLevel,
      polygonId: annotation.id,
    };

    polygons.push(polygon);
    annotationsInfos.push(annotationInfos);
    annotation.polygon.points;
  });

  return { polygons, annotationsInfos };
};
