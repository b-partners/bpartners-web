import { AnnotationCoveringType, AnnotationLabelsType } from '@/constants';
import { Alphabet } from '@/constants/alphabet';
import { detectionResultLabelName } from '@/operations/prospects/constants';
import { Polygon } from '@bpartners/annotator-component';
import { AreaPictureAnnotationInstance } from '@bpartners/typescript-client';
import { AnnotationInfo } from '../types';

const DEFAULT_ANNOTATION_INFO: AnnotationInfo = {
  labelType: 'roof' as AnnotationInfo['labelType'],
  covering: '' as AnnotationInfo['covering'],
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

const getLabelName = (polygon: Polygon, index: number) => {
  const splittedPolygonId = polygon.id.split('___');
  const labelName =
    splittedPolygonId.length === 2 ? `${(detectionResultLabelName as any)[splittedPolygonId[1]]} ${Alphabet[index]}` : `Polygone ${Alphabet[index]}`;
  return labelName;
};

export const createDefaultAnnotationInfo = (polygon: Polygon, index: number): AnnotationInfo => {
  return {
    ...DEFAULT_ANNOTATION_INFO,
    polygonId: polygon.id || '',
    labelName: getLabelName(polygon, index),
    fillColor: polygon.fillColor || '',
    area: polygon.surface,
  };
};

export const getSynchronizedAnnotationInfos = (
  polygons: Polygon[],
  annotationInfos: AnnotationInfo[],
  roofAnnotationInfo: AnnotationInfo
): AnnotationInfo[] => {
  return polygons.map((polygon, index) => {
    if (polygon.id === 'roof-polygon') return roofAnnotationInfo;
    const annotationInfo = annotationInfos.find(annotationInfo => annotationInfo.polygonId === polygon.id);
    return annotationInfo ?? createDefaultAnnotationInfo(polygon, index);
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
