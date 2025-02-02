import { AreaPictureAnnotationInstance } from '@bpartners/typescript-client';
import { AnnotationInfo } from '../types';
import { AnnotationCoveringType, AnnotationLabelsType } from '@/constants';

export const mapAreaAnnotationInstanceToAnnotationInfo = (annotationInstance: AreaPictureAnnotationInstance): AnnotationInfo => {
  const { metadata = {}, labelName = '', labelType = '' } = annotationInstance;
  const {
    humidityLevel = 0,
    fillColor = '',
    strokeColor = '',
    comment = '',
    covering = '',
    wearLevel = 0,
    slope = 0,
    wearness = null,
    moldRate = 0,
    obstacle = '',
  } = metadata;
  return {
    polygonId: annotationInstance.id,
    labelType: labelType as keyof AnnotationLabelsType,
    covering: covering as keyof AnnotationCoveringType,
    slope,
    wear: wearness,
    wearLevel,
    obstacle,
    comment,
    moldRate,
    fillColor,
    labelName,
    strokeColor,
    humidityLevel,
  };
};
