import { ANNOTATION_COVERING_TRANSLATION, ANNOTATION_LABELS_TRANSLATION, ANNOTATION_WEAR_TRANSLATION } from '@/constants';
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

export const translateAnnotationInfo = (info: AnnotationInfo & { area: number }): { label: string; value: string }[] => {
  return [
    formatInfo({ label: 'Type', value: info?.labelType, translator: ANNOTATION_LABELS_TRANSLATION }),
    formatInfo({ label: 'Surface', value: info?.area, unit: 'm²' }),
    formatInfo({ label: 'Revêtement', value: info?.covering, translator: ANNOTATION_COVERING_TRANSLATION }),
    formatInfo({ label: 'Pente', value: info?.slope, unit: '/12' }),
    formatInfo({ label: 'Usure', value: info?.wear, translator: ANNOTATION_WEAR_TRANSLATION }),
    formatInfo({ label: "Taux d'usure", value: info?.wearLevel }),
    formatInfo({ label: 'Taux de moisissure', value: info?.moldRate }),
    formatInfo({ label: "Taux d'humidité", value: info?.humidityLevel }),
    formatInfo({ label: 'Obstacle', value: info?.obstacle }),
    formatInfo({ label: 'Commentaire', value: info?.comment }),
  ];
};
