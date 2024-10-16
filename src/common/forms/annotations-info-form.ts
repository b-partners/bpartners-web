/* eslint-disable react-hooks/exhaustive-deps */
import { AnnotationInfo, NumberAsString } from '@/operations/annotator';
import { cache, getCached } from '@/providers';
import { Polygon } from '@bpartners/typescript-client';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

const defaultAnnotationInfo: AnnotationInfo = {
  labelType: '',
  covering: '',
  slope: 0,
  wearLevel: 0,
  obstacle: '',
  comment: '',
  moldRate: 0,
  wear: null,
  fillColor: '',
  labelName: '',
  strokeColor: '',
};

export const useAnnotationsInfoForm = (polygons: Polygon[] = []) => {
  const defaultValues = polygons.map(() => defaultAnnotationInfo);
  const form = useForm<AnnotationInfo[]>({ defaultValues });

  useEffect(() => {
    const cachedDefaultAnnotationInfo = getCached.annotationsInfo();
    if (cachedDefaultAnnotationInfo) {
      Object.keys(cachedDefaultAnnotationInfo).forEach(index => form.setValue(index as NumberAsString, cachedDefaultAnnotationInfo[index as NumberAsString]));
    }
    form.watch(cache.annotationsInfo);
  }, []);

  return form;
};
