import { DraftAnnotationFilterKey } from '@/common/store/types';

export const degradationLevels = [
  { label: 'A', color: '#47BE62', textColor: '#fff', name: 'Bon état' },
  { label: 'B', color: '#F4FBAB', textColor: '#555', name: 'Entretien à prévoir' },
  { label: 'C', color: '#F9DD56', textColor: '#555', name: 'Entretien nécessaire' },
  { label: 'D', color: '#F38F4B', textColor: '#fff', name: 'Réparation nécessaire' },
  { label: 'E', color: '#EF2C2D', textColor: '#fff', name: 'Intervention urgente' },
];

export const detectionResultColors = {
  MOISISSURE_COULEUR: '#f68817',
  MOISISSURE_CLAIR: '#f68817',
  MOISISSURE_NOIRCIE: '#f68817',
  MOISISSURE: '#f68817',
  HUMIDITE_CLAIR: '#4987eb',
  HUMIDITE_INTENSE: '#4987eb',
  HUMIDITE: '#4987eb',
  USURE_LEGER: '#898c94',
  USURE_IMPORTANTE: '#898c94',
  USURE: '#898c94',
  OBSTACLE: '#ffffff',
  CHEMINEE: '#ffffff',
  VELUX: '#ffffff',
  TOIT: '#00ff00',
};

export const detectionResultLabelName = {
  MOISISSURE_COULEUR: 'Moisissure Couleur',
  MOISISSURE_CLAIR: 'Moisissure Clair',
  MOISISSURE_NOIRCIE: 'Moisissure Noircie',
  MOISISSURE: 'Moisissure',
  HUMIDITE_CLAIR: 'Humidite Clair',
  HUMIDITE_INTENSE: 'Humidite Intense',
  HUMIDITE: 'Humidite',
  USURE_LEGER: 'Usure Leger',
  USURE_IMPORTANTE: 'Usure Importante',
  USURE: 'Usure',
  OBSTACLE: 'Obstacle',
  CHEMINEE: 'Cheminee',
  VELUX: 'Velux',
};

export const roofGlobalIdRef = 'roof-polygon';
export const analyseGeneratedIdRef = '___';
export const analyseRoofIdRef = 'analyse-roof';

export interface DraftAnnotationFilterConfig {
  key: DraftAnnotationFilterKey;
  label: string;
  type: 'text' | 'date';
}

// Add an entry here to expose a new /projects filter — the filter bar and store pick it up automatically.
export const draftAnnotationFilters: DraftAnnotationFilterConfig[] = [
  { key: 'prospectName', label: 'Rechercher un prospect', type: 'text' },
  { key: 'address', label: 'Rechercher une adresse', type: 'text' },
  { key: 'creationFrom', label: 'Créé après le', type: 'date' },
  { key: 'creationTo', label: 'Créé avant le', type: 'date' },
];
