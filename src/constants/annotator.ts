interface Label {
  id: string;
  name: string;
}

export const labels: Label[] = [
  { id: 'roof', name: 'Toit' },
  { id: 'velux', name: 'Velux' },
];
export const covering = [
  { id: 'tuiles', name: 'Tuiles' },
  { id: 'ardoise', name: 'Ardoise' },
  { id: 'beton', name: 'Béton' },
  { id: 'autre', name: 'Autre' },
];

export const wear = [
  { id: 'LOW', name: '1. Minime' },
  { id: 'PARTIAL', name: '2. Partielle' },
  { id: 'ADVANCED', name: '3. Avancée' },
  { id: 'EXTREME', name: '4. Extrême' },
];

export const wearTranslation = {
  LOW: 'Minime',
  PARTIAL: 'Partielle',
  ADVANCED: 'Avancée',
  EXTREME: 'Extrême',
};

export const MEASUREMENT_MAP_ON_EXTENDED = 9;
