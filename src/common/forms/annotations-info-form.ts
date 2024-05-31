/* eslint-disable react-hooks/exhaustive-deps */
import { Polygon } from '@bpartners/typescript-client';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { AnnotationInfo, NumberAsString } from 'src/operations/annotator';
import { cache, getCached } from 'src/providers';

const defaultAnnotationInfo = {
  labelType: '',
  covering: '',
  slope: 0,
  wearLevel: 0,
  obstacle: '',
  comment: '',
};

export const useAnnotationsInfoForm = (polygons: Polygon[] = []) => {
  const defaultValues = polygons.map(() => defaultAnnotationInfo);
  const form = useForm<AnnotationInfo[]>({ defaultValues });

  useEffect(() => {
    const cachedDefaultAnnotationInfo = getCached.annotationsInfo();
    if (cachedDefaultAnnotationInfo) {
      console.log(cachedDefaultAnnotationInfo);
      Object.keys(cachedDefaultAnnotationInfo).forEach(index => form.setValue(index as NumberAsString, cachedDefaultAnnotationInfo[index as NumberAsString]));
    }
    form.watch(cache.annotationsInfo);
  }, []);

  return form;
};
