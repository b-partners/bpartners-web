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
  { id: 'beton', name: 'Beton' },
  { id: 'autre', name: 'Autre' },
];

export const wear = [
  { id: 'LOW', name: '1. minime' },
  { id: 'PARTIAL', name: '2.partielle' },
  { id: 'ADVANCED', name: '3.avancée' },
  { id: 'EXTREME', name: '4 extrême' },
];
