import { useAnnotatorComponentStore } from '@/common/store';
import { parseUrlParams } from '@/common/utils';
import { roofGlobalIdRef } from '@/operations/prospects/constants';
import { annotatorProvider } from '@/providers/annotator-provider';
import { AreaPictureAnnotation, Polygon } from '@bpartners/typescript-client';
import { useEffect, useState } from 'react';

export type RetrievedPolygonsType = {
  annotations: AreaPictureAnnotation;
  polygons: Polygon[];
};

const getPolygonsFromAreaPictureAnnotation = (areaPictureAnnotation: AreaPictureAnnotation): Polygon[] => {
  const result = areaPictureAnnotation.annotations.map(annotation => ({
    id: annotation.id,
    fillColor: annotation.metadata?.fillColor || '#00ff0040',
    strokeColor: annotation.metadata?.strokeColor || '#00ff00',
    points: annotation.polygon?.points,
  }));

  const roof = result.find(p => p?.id?.includes(roofGlobalIdRef));
  if (roof) return [roof, ...result.filter(p => !p.id?.includes(roofGlobalIdRef))];

  return result;
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
  const { setSlopeAndHeightState, setGlobalRate, setLlm } = useAnnotatorComponentStore();

  useEffect(() => {
    if (!pictureId) {
      return;
    }

    if (areaPictureAnnotationFetcher) {
      areaPictureAnnotationFetcher(pictureId).then(areaPictureAnnotations => {
        if (areaPictureAnnotations.length > 0) {
          const areaPictureAnnotation = areaPictureAnnotations[0];
          const { global_rate_type, global_rate_value, roofHeight, llm } = areaPictureAnnotation?.properties || {};
          setLlm(llm);
          setGlobalRate(global_rate_value, global_rate_type);
          setSlopeAndHeightState({
            height: roofHeight,
            heightStatus: roofHeight ? 'AVAILABLE' : 'UNAVAILABLE',
            slope: annotations?.annotations?.[0]?.metadata?.slope,
            slopeStatus: 'AVAILABLE',
          });

          const roofAnnotation = areaPictureAnnotation.annotations.find(a => a.id?.includes(roofGlobalIdRef));
          if (roofAnnotation)
            areaPictureAnnotation.annotations = [roofAnnotation, ...areaPictureAnnotation.annotations.filter(a => !a.id?.includes(roofGlobalIdRef))];

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
        const { global_rate_type, global_rate_value, roofHeight, llm } = areaPictureAnnotation?.properties || {};
        setLlm(llm);
        setGlobalRate(global_rate_value, global_rate_type);
        setSlopeAndHeightState({
          height: roofHeight,
          heightStatus: roofHeight ? 'AVAILABLE' : 'UNAVAILABLE',
          slope: annotations?.annotations?.[0]?.metadata?.slope,
          slopeStatus: 'AVAILABLE',
        });
        setRetrievedPolygon({
          polygons,
          annotations: areaPictureAnnotation,
        });
      }
    });
  }, [pictureId]);

  return { polygons, annotations, isAnnotationEmpty };
};
