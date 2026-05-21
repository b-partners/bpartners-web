export interface EdgeType {
  id: string;
  labelFr: string;
  hex: string;
  categorie: string;
}

export const EDGE_TYPE_UNKNOWN_ID = 'unknown';

export const EDGE_TYPES: EdgeType[] = [
  { id: EDGE_TYPE_UNKNOWN_ID, labelFr: 'Inconnu', hex: '#9E9E9E', categorie: 'Autre' },
  { id: 'faitage', labelFr: 'Faîtage', hex: '#E63946', categorie: 'Lignes structurelles' },
  { id: 'aretier', labelFr: 'Arêtier', hex: '#F77F00', categorie: 'Lignes structurelles' },
  { id: 'noue', labelFr: 'Noue', hex: '#7209B7', categorie: 'Lignes structurelles' },
  { id: 'rive', labelFr: 'Rive', hex: '#06D6A0', categorie: 'Lignes structurelles' },
  { id: 'egout', labelFr: 'Égout', hex: '#00B4D8', categorie: 'Lignes structurelles' },
  { id: 'gouttiere', labelFr: 'Gouttière', hex: '#0096C7', categorie: 'Évacuation eaux' },
  { id: 'descente-ep', labelFr: 'Descente EP', hex: '#03045E', categorie: 'Évacuation eaux' },
  { id: 'solin', labelFr: 'Solin', hex: '#FFD60A', categorie: 'Étanchéité' },
  { id: 'abergement', labelFr: 'Abergement', hex: '#FFB703', categorie: 'Étanchéité' },
  { id: 'ligne-de-vie', labelFr: 'Ligne de vie', hex: '#C9184A', categorie: 'Sécurité' },
  { id: 'garde-corps-temporaire', labelFr: 'Garde-corps temporaire', hex: '#FF8FA3', categorie: 'Sécurité' },
];

export const getEdgeType = (id: string | undefined): EdgeType => EDGE_TYPES.find(t => t.id === id) ?? EDGE_TYPES[0];
