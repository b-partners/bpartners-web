import { AreaPictureAnnotationInstance } from '@bpartners/typescript-client';
import { AnnotationInfo } from '../types';

export const mapAreaAnnotationInstanceToAnnotationInfo = (annotationInstance: AreaPictureAnnotationInstance): AnnotationInfo => {
  const { metadata = {}, labelName = '', labelType = '' } = annotationInstance;
  const { fillColor = '', strokeColor = '', comment = '', covering = '', wearLevel = 0, slope = 0, wearness = null, moldRate = 0, obstacle = '' } = metadata;
  return {
    polygonId: annotationInstance.id,
    labelType,
    covering,
    slope,
    wear: wearness,
    wearLevel,
    obstacle,
    comment,
    moldRate,
    fillColor,
    labelName,
    strokeColor,
  };
};
