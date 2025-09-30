export const degradationLevels = [
  { label: 'A', color: '#47BE62', name: 'Bon état' },
  { label: 'B', color: '#F4FBAB', name: 'Entretient à prévoir' },
  { label: 'C', color: '#F9DD56FF', name: 'Entretient nécessaire' },
  { label: 'D', color: '#F38F4B', name: 'Réparation nécessaire' },
  { label: 'E', color: '#EF2C2D', name: 'Intervention urgente' },
];

export const detectionResultColors = {
  MOISISSURE_COULEUR: '#32FF7E',
  MOISISSURE_CLAIR: '#32FF7E',
  MOISISSURE_NOIRCIE: '#32FF7E',
  OBSTACLE: '#FF3F34',
  CHEMINEE: '#FF3F34',
  HUMIDITE_CLAIR: '#1E90FF',
  HUMIDITE_INTENSE: '#1E90FF',
  VELUX: '#FF3F34',
  HUMIDITE: '#1E90FF',
  USURE_LEGER: '#FFFFFF',
  USURE_IMPORTANTE: '#FFFFFF',
  USURE: '#FFFFFF',
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
