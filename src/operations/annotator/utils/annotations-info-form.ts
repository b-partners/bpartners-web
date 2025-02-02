import { stringifyObj } from '@/common/utils/stringify';
import { AnnotationInfo } from '@/operations/annotator';
import { cache } from '@/providers';
import { Polygon } from '@bpartners/annotator-component';
import { useEffect } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { getSynchronizedAnnotationInfos } from './annotation-info-mapper';

export const useAnnotationInfosForm = (polygons: Polygon[], defaultAnnotationInfos: AnnotationInfo[] = []) => {
  const formState = useForm<{ annotationInfos: AnnotationInfo[] }>({ defaultValues: { annotationInfos: defaultAnnotationInfos } });
  const fieldArrayState = useFieldArray({
    control: formState.control,
    name: 'annotationInfos',
  });

  const annotationInfos = formState.watch('annotationInfos');

  useEffect(() => {
    if (polygons.length !== annotationInfos.length) {
      const synchronizedAnnotationInfos = getSynchronizedAnnotationInfos(polygons, annotationInfos);
      fieldArrayState.replace(synchronizedAnnotationInfos);
    }
  }, [stringifyObj(annotationInfos), polygons.length]);

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
