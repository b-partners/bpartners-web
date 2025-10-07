import { toRaInputChoices } from '@/common/utils/to-ra-input-choices';
import { Wearness } from '@bpartners/typescript-client';

export const ANNOTATION_LABELS_TRANSLATION = {
  roof: 'Toit',
  velux: 'Velux',
} as const;
export type AnnotationLabelsType = typeof ANNOTATION_LABELS_TRANSLATION;
export const ANNOTATION_LABELS_CHOICES = toRaInputChoices(ANNOTATION_LABELS_TRANSLATION);

export const annotationLabelType = [
  {
    value: 'roof',
    label: 'Toit',
  },
  {
    value: 'velux',
    label: 'Velux',
  },
];

export const coveringTypeMap = {
  ROOF_ARDOISE: 'Ardoise',
  ROOF_ASPHALTE_BITUME: 'Asphalte Bitume',
  ROOF_BAC_ACIER: 'Bac Acier',
  ROOF_BETON_BRUT: 'Béton brut',
  ROOF_FIBRO_CIMENT: 'Fibrociment',
  ROOF_GRAVIER: 'Gravier',
  ROOF_MEMBRANE_SYNTHETIQUE: 'Membrane synthétique',
  ROOF_TOLE_ONDULEE: 'Tôle ondulée',
  ROOF_TUILES: 'Tuiles',
  ROOF_ZINC: 'Zinc',
};

export type AnnotationCoveringType = typeof coveringTypeMap;
export const ANNOTATION_COVERING_CHOICES = toRaInputChoices(coveringTypeMap);

export const ANNOTATION_WEAR_TRANSLATION: Record<Wearness, string> = {
  LOW: 'Minime',
  PARTIAL: 'Partielle',
  ADVANCED: 'Avancée',
  EXTREME: 'Extrême',
} as const;
export type AnnotationWearType = typeof ANNOTATION_WEAR_TRANSLATION;
export const ANNOTATION_WEAR_CHOICES = toRaInputChoices(ANNOTATION_WEAR_TRANSLATION, (value, index) => `${index + 1}. ${value}`);

export const MEASUREMENT_MAP_ON_EXTENDED_AREA = 9;
export const MEASUREMENT_MAP_ON_EXTENDED_LENGTH = 3;
