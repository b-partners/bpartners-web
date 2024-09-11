import { parseUrlParams } from '@/common/utils';
import { annotatorProvider } from '@/providers/annotator-provider';
import { AreaPictureAnnotation, Polygon } from '@bpartners/typescript-client';
import { useEffect, useState } from 'react';

export type AreaPictureAnnotationFetcherType = (pictureId: string) => Promise<AreaPictureAnnotation[]>;

export const useRetrievePolygons = (areaPictureAnnotationFetcher?: AreaPictureAnnotationFetcherType) => {
  const { pictureId } = parseUrlParams();
  const [isLoading, setIsLoading] = useState(true);
  const [annotations, setAnnotations] = useState<AreaPictureAnnotation>({});
  const [polygons, setPolygons] = useState<Polygon[]>([]);

  const isAnnotationEmpty = !annotations || Object.keys(annotations || {}).length === 0;

  useEffect(() => {
    if (!pictureId) {
      return;
    }

    if (areaPictureAnnotationFetcher) {
      areaPictureAnnotationFetcher(pictureId)
        .then(annotations => {
          if (annotations.length > 0) {
            setAnnotations(annotations[0]);
          }
        })
        .then(() => {
          setIsLoading(false);
        });
      return;
    }

    annotatorProvider
      .getAnnotationsPicture(pictureId)
      .then(annotations => {
        if (annotations.length > 0) {
          setAnnotations(annotations[0]);
        }
      })
      .then(() => {
        setIsLoading(false);
      });
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

  return { polygons, annotations, isAnnotationEmpty, isLoading };
};
