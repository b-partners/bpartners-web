import { Alphabet } from '@/constants/alphabet';
import { Polygon } from '@bpartners/annotator-component';
import { AreaPictureAnnotationInstance } from '@bpartners/typescript-client';
import { AnnotationInfo } from '../types';
import { AnnotationCoveringType, AnnotationLabelsType } from '@/constants';

const DEFAULT_ANNOTATION_INFO: AnnotationInfo = {
  labelType: '' as AnnotationInfo["labelType"],
  covering: '' as AnnotationInfo["covering"],
  slope: 0,
  wearLevel: 0,
  obstacle: '',
  comment: '',
  moldRate: 0,
  wear: '' as AnnotationInfo['wear'],
  fillColor: '',
  labelName: '',
  strokeColor: '',
};

export const createDefaultAnnotationInfo = (polygonId: string, index: number): AnnotationInfo => {
  return { ...DEFAULT_ANNOTATION_INFO, polygonId, labelName: `Polygone ${Alphabet[index]}` };
};

export const getSynchronizedAnnotationInfos = (polygons: Polygon[], annotationInfos: AnnotationInfo[]): AnnotationInfo[] => {
  return polygons.map((polygon, index) => {
    const annotationInfo = annotationInfos.find(annotationInfo => annotationInfo.polygonId === polygon.id);
    return annotationInfo ?? createDefaultAnnotationInfo(polygon.id, index);
  });
};

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
