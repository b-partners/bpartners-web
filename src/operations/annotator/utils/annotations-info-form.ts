import { useQuerySlopeAndHeight } from '@/common/fetcher';
import { RoofAnalyseProperties, useAnnotatorComponentStore } from '@/common/store';
import { stringifyObj } from '@/common/utils/stringify';
import { AnnotationInfo } from '@/operations/annotator';
import { cache } from '@/providers';
import { Polygon } from '@bpartners/annotator-component';
import { useEffect } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { getSynchronizedAnnotationInfos } from './annotation-info-mapper';

const getLevelValue = (n: number) => Math.floor(n / 10) * 10;

const createAnnotationInfoFromRoofAnalyseProperties = (roofAnalyseProperties: RoofAnalyseProperties, height = -1, slope = -1) => {
  if (!roofAnalyseProperties) return undefined;

  const { humidite_rate, moisissure_rate, obstacle, usure_rate, revetement_1, revetement_2 } = roofAnalyseProperties || {};

  const roofAnalysePropertiesInfos: AnnotationInfo = {
    humidityLevel: getLevelValue(humidite_rate),
    wearLevel: getLevelValue(usure_rate),
    moldRate: getLevelValue(moisissure_rate),
    obstacle: `${obstacle ? 'OUI' : 'NON'}`,
    labelName: "Résultats de l'analyse de la toiture",
    labelType: 'roof',
    polygonId: 'roof-polygon',
    covering: revetement_1,
    covering2: revetement_2,
    slope,
    height,
  };
  return roofAnalysePropertiesInfos;
};

export const useAnnotationInfosForm = (polygons: Polygon[], defaultAnnotationInfos: AnnotationInfo[] = [], roofAnalyseProperties: RoofAnalyseProperties) => {
  const formState = useForm<{ annotationInfos: AnnotationInfo[] }>({ defaultValues: { annotationInfos: defaultAnnotationInfos } });
  const fieldArrayState = useFieldArray({
    control: formState.control,
    name: 'annotationInfos',
  });
  const { setRoofSlope } = useAnnotatorComponentStore();
  const { thereIsRoofPolygon } = useAnnotatorComponentStore();

  const { data } = useQuerySlopeAndHeight(() => {}, polygons.length === 1 && thereIsRoofPolygon);

  useEffect(() => {
    const unsubscribe = useAnnotatorComponentStore.subscribe(({ slopeAndHeightState }) => {
      if (slopeAndHeightState?.slope && slopeAndHeightState?.height) {
        formState.setValue('annotationInfos.0.slope', slopeAndHeightState?.slope);
        formState.setValue('annotationInfos.0.height', slopeAndHeightState?.height);
        setRoofSlope(slopeAndHeightState?.slope);
      }
    });

    return unsubscribe;
  }, []);

  const annotationInfos = formState.watch('annotationInfos');

  useEffect(() => {
    if (polygons.length !== annotationInfos.length) {
      const synchronizedAnnotationInfos = getSynchronizedAnnotationInfos(
        polygons,
        annotationInfos,
        createAnnotationInfoFromRoofAnalyseProperties(roofAnalyseProperties, data?.height, data?.slope)
      );
      fieldArrayState.replace(synchronizedAnnotationInfos);
    }
  }, [stringifyObj(annotationInfos), polygons.length, data]);

  useEffect(() => {
    const subscription = formState.watch(({ annotationInfos: currentAnnotationInfos = [] }) => {
      cache.annotationsInfo(currentAnnotationInfos);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    cache.annotationsInfo(formState.getValues('annotationInfos'));
  }, []);

  return { formState, fieldArrayState };
};
