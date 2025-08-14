import { toRaInputChoices } from '@/common/utils/to-ra-input-choices';
import { Wearness } from '@bpartners/typescript-client';

export const ANNOTATION_LABELS_TRANSLATION = {
  roof: 'Toit',
  velux: 'Velux',
} as const;
export type AnnotationLabelsType = typeof ANNOTATION_LABELS_TRANSLATION;
export const ANNOTATION_LABELS_CHOICES = toRaInputChoices(ANNOTATION_LABELS_TRANSLATION);

export const ANNOTATION_COVERING_TRANSLATION = {
  'tuiles-canal': 'Tuiles canal',
  'tuiles-plates': 'Tuiles plates',
  ardoise: 'Ardoise',
  zinc: 'Zinc',
  shingle: 'Shingle',
  beton: 'Béton',
  'bac-acier': 'Bac acier',
  'bardeaux-bitumineux': 'Bardeaux bitumineux',
  'fibro-ciment': 'Fibro-ciment',
  'membrane-elastomere': 'Membrane élastomère',
  autres: 'Autres',
  tuiles: 'Tuiles',
} as const;
export type AnnotationCoveringType = typeof ANNOTATION_COVERING_TRANSLATION;
export const ANNOTATION_COVERING_CHOICES = toRaInputChoices(ANNOTATION_COVERING_TRANSLATION);

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
