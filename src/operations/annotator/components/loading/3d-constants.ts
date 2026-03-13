export const PALETTE = {
  pine: 0x4a644e,
  linen: 0xbeb4a4,
  cream: 0xf0ece1,
  forest: 0x112717,
  neonOrange: 0xff521b,
};

export const BASE_DEPTH = 1.0;
export const ROTATION_SPEED = 0.007;
export const SCAN_COLOR = PALETTE.neonOrange;
export const SCANNER_SCALE = 1.15;
export const SCAN_TOP = 0.1;
export const SCAN_BOTTOM = -BASE_DEPTH - 0.1;
export const SCAN_PERIOD = 4;
export const PARTICLE_COUNT = 280;
export const PHASE_POLYGON_DURATION = 1200;
export const PHASE_EXTRUDE_DURATION = 10000;
export const PHASE_SCANNER_DELAY = 100;

export const STEPS = [
  { index: 1, label: 'Analyse du polygone' },
  { index: 2, label: 'Calcul des surfaces' },
  { index: 3, label: 'Génération du modèle 3D' },
];

export const STEP_DURATION: Record<number, number> = { 0: 2400, 1: 3200, 2: 5000 };

export const ORANGE_R = 0xff / 255;
export const ORANGE_G = 0x52 / 255;
export const ORANGE_B = 0x1b / 255;
