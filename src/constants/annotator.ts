import { toRaInputChoices } from '@/common/utils/to-ra-input-choices';
import { ExportAreaPictureAnnotationConf, Wearness } from '@bpartners/typescript-client';

export const ANNOTATION_LABELS_TRANSLATION = {
  roof: 'Toit',
  velux: 'Velux',
  pan: 'Pan',
} as const;
export type AnnotationLabelsType = typeof ANNOTATION_LABELS_TRANSLATION;
export const ANNOTATION_LABELS_CHOICES = toRaInputChoices(ANNOTATION_LABELS_TRANSLATION);

export const ANNOTATION_2D_LABELS_TRANSLATION = {
  roof: 'Toit',
  pan: 'Pan',
} as const;
export const ANNOTATION_2D_LABELS_CHOICES = toRaInputChoices(ANNOTATION_2D_LABELS_TRANSLATION);
export const ANNOTATION_2D_PAN_ONLY_CHOICES = toRaInputChoices({ pan: 'Pan' });

export const ANNOTATION_ANALYSE_LABELS_TRANSLATION = {
  roof: 'Toit',
  velux: 'Velux',
} as const;
export const ANNOTATION_ANALYSE_LABELS_CHOICES = toRaInputChoices(ANNOTATION_ANALYSE_LABELS_TRANSLATION);

export const ANALYSE_IMAGE_SUFFIX = '_analyse_image';
export const getAnalyseImageFileId = (fileId: string) => `${fileId}${ANALYSE_IMAGE_SUFFIX}`;

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

export const DEFAULT_EXPORT_PDF_CONF: Required<ExportAreaPictureAnnotationConf> = {
  showTitlePage: true,
  showAnnotationPages: true,
  showAnnotation3dPages: true,
  showMeasurementSummary: true,
  showPitchSummary: true,
  showAreaSummary: true,
  showOverallSummary: true,
  showLlmSummary: true,
};

export const EXPORT_PDF_CONF_OPTIONS: { key: keyof ExportAreaPictureAnnotationConf; label: string }[] = [
  { key: 'showTitlePage', label: 'Page de titre' },
  { key: 'showAnnotationPages', label: "Pages d'annotation 2D" },
  { key: 'showAnnotation3dPages', label: "Pages d'annotation 3D" },
  { key: 'showMeasurementSummary', label: 'Résumé des mesures' },
  { key: 'showPitchSummary', label: 'Résumé des pentes' },
  { key: 'showAreaSummary', label: 'Résumé des surfaces' },
  { key: 'showOverallSummary', label: 'Résumé global' },
  { key: 'showLlmSummary', label: "Résumé de l'analyse IA" },
];
