import { Alphabet } from '@/constants/alphabet';
import { AnnotationInfo } from '@/operations/annotator';
import { Polygon } from '@bpartners/annotator-component';

const DEFAULT_ANNOTATION_INFO: AnnotationInfo = {
  labelType: '',
  covering: '',
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

const createDefaultAnnotationInfo = (polygonId: string, index: number): AnnotationInfo => {
  return { ...DEFAULT_ANNOTATION_INFO, polygonId, labelName: `Polygone ${Alphabet[index]}` };
};

export const getSynchronizedAnnotationInfos = (polygons: Polygon[], annotationInfos: AnnotationInfo[]): AnnotationInfo[] => {
  return polygons.map((polygon, index) => {
    const annotationInfo = annotationInfos.find(annotationInfo => annotationInfo.polygonId === polygon.id);
    return annotationInfo ?? createDefaultAnnotationInfo(polygon.id, index);
  });
};
