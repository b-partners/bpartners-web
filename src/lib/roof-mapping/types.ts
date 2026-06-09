export type RoofEdgeTypeId = 'faitage' | 'aretier' | 'noue' | 'egout' | 'rive' | 'unknown';

export type RoofEdgeTypeMap = Record<number, Record<number, string>>;

export interface RoofMappingResult {
  edgeTypes: RoofEdgeTypeMap;
  buildingConfidence: number;
}

export interface RoofMappingThresholds {
  horizontalSlopeDeg: number;
  minEdgeLengthMeters: number;
  ridgeAltitudeToleranceMeters: number;
}

export const DEFAULT_THRESHOLDS: RoofMappingThresholds = {
  horizontalSlopeDeg: 8,
  minEdgeLengthMeters: 0.01,
  ridgeAltitudeToleranceMeters: 0.3,
};
