import { ANNOTATION_LABELS_TRANSLATION, ANNOTATION_WEAR_TRANSLATION, AnnotationCoveringType, AnnotationLabelsType, coveringTypeMap } from '@/constants';
import { roofGlobalIdRef } from '@/operations/prospects/constants';
import { AreaPictureAnnotationInstance, Wearness } from '@bpartners/typescript-client';

export const EMPTY_ANNOTATION_INFO_VALUE = 'Non renseigné';

export interface AnnotationInfo {
  polygonId: string;
  labelName: string;
  labelType: keyof AnnotationLabelsType;
  covering: keyof AnnotationCoveringType;
  slope: number;
  wear: Wearness;
  wearLevel: number;
  moldRate: number;
  humidityLevel: number;
  obstacle: string;
  comment: string;
  area?: number;
}

type FormatInfoArgs<T extends object = any, K extends keyof T = any> = {
  label: string;
  value?: K;
  translator?: T;
  unit?: string;
};

const formatInfo = <T extends object = any, K extends keyof T = any>({ label, translator, value, unit = '' }: FormatInfoArgs<T, K>) => {
  if (!value) return { label, value: EMPTY_ANNOTATION_INFO_VALUE };
  const translatedValue = translator ? translator[value] : value;
  return { label, value: translatedValue ? translatedValue + unit : EMPTY_ANNOTATION_INFO_VALUE };
};

export const mapAreaAnnotationInstanceToAnnotationInfo = (annotationInstance: AreaPictureAnnotationInstance): AnnotationInfo => {
  const { metadata = {}, labelName = '', labelType = '' } = annotationInstance;
  const { humidityLevel = 0, comment = '', covering = '', wearLevel = 0, slope = 0, wearness = null, moldRate = 0, obstacle = '' } = metadata;

  return {
    polygonId: annotationInstance.id,
    labelName,
    labelType: labelType as keyof AnnotationLabelsType,
    covering: covering as keyof AnnotationCoveringType,
    slope,
    wear: wearness,
    wearLevel,
    moldRate,
    humidityLevel,
    obstacle,
    comment,
  };
};

export const translateAnnotationInfo = (info: AnnotationInfo): { label: string; value: string }[] => {
  const isAnalyseResult = info.polygonId?.includes('___');
  const isRoofPolygon = info.polygonId?.includes(roofGlobalIdRef);
  const surfaceLabel = isRoofPolygon ? (info?.slope > 0 ? 'Surface rampante' : 'Surface au sol') : 'Surface';

  const result = [formatInfo({ label: surfaceLabel, value: info?.area, unit: 'm²' })];

  if (!isAnalyseResult) {
    result.push(
      formatInfo({ label: 'Type', value: info?.labelType, translator: ANNOTATION_LABELS_TRANSLATION }),
      formatInfo({ label: 'Revêtement', value: info?.covering, translator: coveringTypeMap }),
      formatInfo({ label: 'Pente', value: info?.slope, unit: '°' }),
      formatInfo({ label: 'Usure', value: info?.wear, translator: ANNOTATION_WEAR_TRANSLATION }),
      formatInfo({ label: "Taux d'usure", value: info?.wearLevel, unit: '%' }),
      formatInfo({ label: 'Taux de moisissure', value: info?.moldRate, unit: '%' }),
      formatInfo({ label: "Taux d'humidité", value: info?.humidityLevel, unit: '%' }),
      formatInfo({ label: 'Obstacle', value: info?.obstacle }),
      formatInfo({ label: 'Commentaire', value: info?.comment })
    );
  }

  return result;
};
