import { parseUrlParams } from '@/common/utils';
import { annotatorProvider } from '@/providers/annotator-provider';
import { AreaPictureAnnotation, Polygon } from '@bpartners/typescript-client';
import { useEffect, useState } from 'react';

export const useRetrievePolygons = () => {
  const { pictureId } = parseUrlParams();
  const [annotations, setAnnotations] = useState<AreaPictureAnnotation>({});
  const [polygons, setPolygons] = useState<Polygon[]>([]);

  const isAnnotationEmpty = !annotations || Object.keys(annotations || {}).length === 0;

  useEffect(() => {
    if (pictureId) {
      annotatorProvider.getAnnotationsPicture(pictureId).then(annotations => {
        setAnnotations(annotations[0]);
      });
    }
  }, [pictureId]);

  useEffect(() => {
    if (!isAnnotationEmpty) {
      const newPolygons = annotations?.annotations.map(annotation => ({
        id: annotation.id,
        fillColor: '#00ff0040',
        strokeColor: '#00ff00',
        points: annotation.polygon?.points,
      }));
      setPolygons(newPolygons);
    }
  }, [annotations, setPolygons, isAnnotationEmpty]);

  return { polygons, annotations, isAnnotationEmpty };
};
