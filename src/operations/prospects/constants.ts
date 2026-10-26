import { DraftAnnotationFilterKey } from '@/common/store/types';
export const roofGlobalIdRef = 'roof-polygon';

export interface DraftAnnotationFilterConfig {
  key: DraftAnnotationFilterKey;
  label: string;
  placeholder?: string;
  type: 'text' | 'date';
}

// Add an entry here to expose a new /projects filter — the filter bar and store pick it up automatically.
export const draftAnnotationFilters: DraftAnnotationFilterConfig[] = [
  { key: 'prospectName', label: 'Prospect', placeholder: 'Rechercher un prospect', type: 'text' },
  { key: 'address', label: 'Adresse', placeholder: 'Rechercher une adresse', type: 'text' },
  { key: 'creationFrom', label: 'Créé après le', type: 'date' },
  { key: 'creationTo', label: 'Créé avant le', type: 'date' },
];
