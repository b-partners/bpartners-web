import { useQuerySlopeAndHeight } from '@/common/fetcher';
import { RoofAnalyseProperties, useAnnotatorComponentStore } from '@/common/store';
import { AnnotationInfo } from '@/operations/annotator';
import { cache } from '@/providers';
import { Polygon } from '@bpartners/annotator-component';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

export const createAnnotationInfoFromRoofAnalyseProperties = (polygonId: string, roofAnalyseProperties: RoofAnalyseProperties, height = -1, slope = -1) => {
  if (!roofAnalyseProperties) return undefined;

  const { humidite_rate, moisissure_rate, obstacle, usure_rate, revetement_1, revetement_2 } = roofAnalyseProperties || {};

  const roofAnalysePropertiesInfos: AnnotationInfo = {
    humidityLevel: humidite_rate,
    wearLevel: usure_rate,
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
  };
  return roofAnalysePropertiesInfos;
};

export type AnnotatorFormState = { annotationInfos: AnnotationInfo[]; polygons: Polygon[] };

export const useAnnotationInfosForm = (defaultPolygons: Polygon[], defaultAnnotationInfos: AnnotationInfo[] = []) => {
  const formState = useForm<AnnotatorFormState>({ defaultValues: { annotationInfos: [], polygons: [] } });
  const { setThereIsRoofPolygon, thereIsRoofPolygon } = useAnnotatorComponentStore();

  const { setRoofSlope } = useAnnotatorComponentStore();

  useEffect(() => {
    formState.setValue('annotationInfos', defaultAnnotationInfos);
    formState.setValue('polygons', defaultPolygons);
  }, [JSON.stringify(defaultAnnotationInfos), JSON.stringify(defaultPolygons)]);

  useQuerySlopeAndHeight(({ height, slope }) => {
    formState.setValue('annotationInfos.0.slope', slope, { shouldDirty: false });
    formState.setValue('annotationInfos.0.height', height, { shouldDirty: false });
    setRoofSlope(slope);
  }, true);

  useEffect(() => {
    const subscription = formState.watch(({ annotationInfos, polygons }) => {
      cache.annotationsInfo(annotationInfos);
      cache.polygons(polygons as Polygon[]);
      if (annotationInfos.length === 1 && annotationInfos[0].labelType === 'roof' && !thereIsRoofPolygon) setThereIsRoofPolygon(true);
      else if (thereIsRoofPolygon) setThereIsRoofPolygon(false);
    });

    return subscription.unsubscribe;
  }, []);

  useEffect(() => {
    cache.annotationsInfo(formState.getValues('annotationInfos'));
  }, []);

  return formState;
};
