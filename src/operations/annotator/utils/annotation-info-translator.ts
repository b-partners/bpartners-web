import { ANNOTATION_LABELS_TRANSLATION, ANNOTATION_WEAR_TRANSLATION, coveringTypeMap } from '@/constants';
import { roofGlobalIdRef } from '@/operations/prospects/constants';
import { AnnotationInfo } from '../types';

export const EMPTY_ANNOTATION_INFO_VALUE = 'Non renseigné';
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

export const translateAnnotationInfo = (info: AnnotationInfo & { area: number }, isAfterAnalyse = false): { label: string; value: string }[] => {
  const isAnalyseResult = info.polygonId.includes('___');
  const isRoofPolygon = info.polygonId.includes(roofGlobalIdRef);
  const hasDynamicSurfaceLabel = isRoofPolygon || isAfterAnalyse;
  const surfaceLabel = hasDynamicSurfaceLabel ? (info?.slope > 0 ? 'Surface rampante' : 'Surface au sol') : 'Surface';

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
