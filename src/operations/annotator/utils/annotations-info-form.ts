import { useQuerySlopeAndHeight } from '@/common/fetcher';
import { annotatorStore, RoofAnalyseProperties, useAnnotatorComponentStore } from '@/common/store';
import { copyObject } from '@/common/utils';
import { AnnotationInfo } from '@/operations/annotator';
import { cache } from '@/providers';
import { Polygon } from '@bpartners/annotator-component';
import { Wearness } from '@bpartners/typescript-client';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

const getWearness = (wearLevel: number) => {
  if (wearLevel <= 10) return Wearness.LOW;
  if (wearLevel <= 50) return Wearness.PARTIAL;
  if (wearLevel <= 90) return Wearness.ADVANCED;
  return Wearness.EXTREME;
};

export const createAnnotationInfoFromRoofAnalyseProperties = (
  polygonId: string,
  roofAnalyseProperties: RoofAnalyseProperties,
  height: number,
  slope: number
) => {
  if (!roofAnalyseProperties) return undefined;

  const { humidite_rate, moisissure_rate, obstacle, usure_rate, revetement_1, revetement_2, roof_area_in_m2 } = roofAnalyseProperties || {};

  const roofAnalysePropertiesInfos: AnnotationInfo = {
    humidityLevel: humidite_rate,
    wearLevel: usure_rate,
    wear: getWearness(usure_rate),
    moldRate: moisissure_rate,
    obstacle: `${obstacle ? 'OUI' : 'NON'}`,
    labelName: "Résultats de l'analyse de la toiture",
    labelType: 'roof',
    polygonId,
    covering: revetement_1,
    covering2: revetement_2,
    slope,
    height,
    fillColor: '#00ff0000',
    strokeColor: '#00ff00',
    area: +(roof_area_in_m2 || 0)?.toFixed(2),
  };
  return roofAnalysePropertiesInfos;
};

export type AnnotatorFormState = { annotationInfos: AnnotationInfo[]; polygons: Polygon[] };

export const useAnnotationInfosForm = () => {
  const formState = useForm<AnnotatorFormState>({ defaultValues: { annotationInfos: [], polygons: [] } });
  const { setThereIsRoofPolygon, thereIsRoofPolygon } = useAnnotatorComponentStore();
  const updateRoofAnnotation = annotatorStore.useAnnotatorStore(params => params.updateRoofAnnotation);
  const { setRoofSlope } = useAnnotatorComponentStore();

  useQuerySlopeAndHeight(({ height, slope }) => {
    updateRoofAnnotation(_annotation => {
      const annotation = copyObject(_annotation);
      annotation.annotationInfos.slope = slope;
      annotation.annotationInfos.height = height;
      return annotation;
    });
    setRoofSlope(slope);
  }, true);

  useEffect(() => {
    const subscription = annotatorStore.useAnnotatorStore.subscribe(({ annotations }) => {
      const annotationInfos: AnnotationInfo[] = [];
      const polygons: AnnotationInfo[] = [];

      Object.values(annotations).forEach(({ annotationInfos: _annotationInfos, polygon: _polygon }) => {
        annotationInfos.push(_annotationInfos);
        polygons.push(_polygon);
      });

      cache.annotationsInfo(annotationInfos);
      cache.polygons(polygons as Polygon[]);

      if (annotationInfos.length === 1 && annotationInfos[0].labelType === 'roof' && !thereIsRoofPolygon) setThereIsRoofPolygon(true);
      else if (thereIsRoofPolygon) setThereIsRoofPolygon(false);
    });

    return subscription;
  }, []);

  return formState;
};
