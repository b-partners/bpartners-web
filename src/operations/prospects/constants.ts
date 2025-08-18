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
  { label: 'A', color: '#53b76a' },
  { label: 'B', color: '#f7ec94' },
  { label: 'C', color: '#ddc563' },
  { label: 'D', color: '#ee915c' },
  { label: 'E', color: '#e8443b' },
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
