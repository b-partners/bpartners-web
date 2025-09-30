import { AnnotationCoveringType } from '@/constants';

export const ANNOTATION_COVERING: { value: keyof AnnotationCoveringType; label: string }[] = [
  { value: 'tuiles', label: 'Tuiles' },
  { value: 'tuiles-canal', label: 'Tuiles canal' },
  { value: 'tuiles-plates', label: 'Tuiles plates' },
  { value: 'ardoise', label: 'Ardoise' },
  { value: 'zinc', label: 'Zinc' },
  { value: 'shingle', label: 'Shingle' },
  { value: 'beton', label: 'Béton' },
  { value: 'bac-acier', label: 'Bac acier' },
  { value: 'bardeaux-bitumineux', label: 'Bardeaux bitumineux' },
  { value: 'fibro-ciment', label: 'Fibro-ciment' },
  { value: 'membrane-elastomere', label: 'Membrane élastomère' },
  { value: 'autres', label: 'Autres' },
];

export const degradationLevels = [
  { label: 'A', color: '#47BE62', name: 'Bon état' },
  { label: 'B', color: '#F4FBAB', name: 'Entretient à prévoir' },
  { label: 'C', color: '#F9DD56', name: 'Entretient nécessaire' },
  { label: 'D', color: '#F38F4B', name: 'Réparation nécessaire' },
  { label: 'E', color: '#EF2C2D', name: 'Intervention urgente' },
];

export const detectionResultColors = {
  MOISISSURE_COULEUR: '#32FF7E',
  MOISISSURE_CLAIR: '#32FF7E',
  MOISISSURE_NOIRCIE: '#32FF7E',
  USURE_LEGER: '#FF7F50',
  USURE_IMPORTANTE: '#FF7F50',
  OBSTACLE: '#FF3F34',
  CHEMINEE: '#FF3F34',
  HUMIDITE_CLAIR: '#1E90FF',
  HUMIDITE_INTENSE: '#1E90FF',
  VELUX: '#FF3F34',
  HUMIDITE: '#1E90FF',
  USURE: '#FF7F50',
  MOISISSURE: '#32FF7E',
};

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

export const coveringTypeNameMap = {
  ROOF_TUILES: 'tuiles',
  ROOF_TOLE_ONDULEE: 'tole-ondulee',
  ROOF_ASPHALTE_BITUME: 'asphalte-bitume',
  ROOF_ARDOISE: 'ardoise',
  ROOF_GRAVIER: 'gravier',
  ROOF_BETON_BRUT: 'beton',
  ROOF_BAC_ACIER: 'bac-acier',
  ROOF_FIBRO_CIMENT: 'fibro-ciment',
  ROOF_MEMBRANE_SYNTHETIQUE: 'membrane-elastomere',
  ROOF_ZINC: 'zinc',
} as const;
