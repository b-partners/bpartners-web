import { parseUrlParams } from '@/common/utils';
import { annotatorProvider } from '@/providers/annotator-provider';
import { AreaPictureAnnotation, Polygon } from '@bpartners/typescript-client';
import { useEffect, useState } from 'react';

export type RetrievedPolygonsType = {
  annotations: AreaPictureAnnotation;
  polygons: Polygon[];
};

const getPolygonsFromAreaPictureAnnotation = (areaPictureAnnotation: AreaPictureAnnotation): Polygon[] => {
  return areaPictureAnnotation.annotations.map(annotation => ({
    id: annotation.id,
    fillColor: annotation.metadata?.fillColor || '#00ff0040',
    strokeColor: annotation.metadata?.strokeColor || '#00ff00',
    points: annotation.polygon?.points,
  }));
};

export type AreaPictureAnnotationFetcherType = (pictureId: string) => Promise<AreaPictureAnnotation[]>;
export const useRetrievePolygons = (areaPictureAnnotationFetcher?: AreaPictureAnnotationFetcherType) => {
  const { pictureId } = parseUrlParams();
  const [retrievedPolygon, setRetrievedPolygon] = useState<RetrievedPolygonsType>({
    annotations: {},
    polygons: [],
  });
  const { polygons, annotations } = retrievedPolygon;
  const isAnnotationEmpty = !annotations || Object.keys(annotations || {}).length === 0;

  useEffect(() => {
    if (!pictureId) {
      return;
    }

    if (areaPictureAnnotationFetcher) {
      areaPictureAnnotationFetcher(pictureId).then(areaPictureAnnotations => {
        if (areaPictureAnnotations.length > 0) {
          const areaPictureAnnotation = areaPictureAnnotations[0];
          const polygons = getPolygonsFromAreaPictureAnnotation(areaPictureAnnotation);
          setRetrievedPolygon({
            polygons,
            annotations: areaPictureAnnotation,
          });
        }
      });
      return;
    }

    annotatorProvider.getAnnotationsPicture(pictureId).then(areaPictureAnnotations => {
      if (areaPictureAnnotations.length > 0) {
        const areaPictureAnnotation = areaPictureAnnotations[0];
        const polygons = getPolygonsFromAreaPictureAnnotation(areaPictureAnnotation);
        setRetrievedPolygon({
          polygons,
          annotations: areaPictureAnnotation,
        });
      }
    });
  }, [pictureId]);

  return { polygons, annotations, isAnnotationEmpty };
};
