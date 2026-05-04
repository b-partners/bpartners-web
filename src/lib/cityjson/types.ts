import * as THREE from "three";

export type SurfaceType =
  | "RoofSurface"
  | "WallSurface"
  | "GroundSurface"
  | "ClosureSurface"
  | "OuterFloorSurface"
  | "OuterCeilingSurface"
  | "InteriorWallSurface"
  | "FloorSurface"
  | "CeilingSurface"
  | "Unknown";

export const DEFAULT_SURFACE_COLORS: Record<SurfaceType, string> = {
  RoofSurface: "#c0392b",
  WallSurface: "#bdc3c7",
  GroundSurface: "#7f8c8d",
  ClosureSurface: "#95a5a6",
  OuterFloorSurface: "#d35400",
  OuterCeilingSurface: "#e67e22",
  InteriorWallSurface: "#ecf0f1",
  FloorSurface: "#a0856c",
  CeilingSurface: "#d5c5b2",
  Unknown: "#ffffff",
};

// ─── Raw CityJSON shape ───────────────────────────────────────────────────────

export interface CityJsonTexture {
  type: string;
  image: string;
}

export interface CityJsonAppearance {
  textures?: CityJsonTexture[];
  "vertices-texture"?: [number, number][];
  materials?: unknown[];
}

export interface CityJsonSemanticSurface {
  type: SurfaceType;
  [key: string]: unknown;
}

export interface CityJsonSemantics {
  surfaces: CityJsonSemanticSurface[];
  values: (number | null)[] | (number | null)[][];
}

export interface CityJsonTextureReference {
  [themeName: string]: {
    values: (number[] | null)[] | (number[] | null)[][];
  };
}

export interface CityJsonGeometry {
  type: string;
  lod?: string | number;
  boundaries: number[][][] | number[][][][];
  semantics?: CityJsonSemantics;
  appearance?: {
    texture?: CityJsonTextureReference;
  };
}

export interface CityJsonObject {
  type: string;
  geometry: CityJsonGeometry[];
  [key: string]: unknown;
}

export interface CityJsonData {
  type: "CityJSON";
  version: string;
  vertices: [number, number, number][];
  appearance?: CityJsonAppearance;
  CityObjects: Record<string, CityJsonObject>;
  metadata?: Record<string, unknown>;
  transform?: {
    scale: [number, number, number];
    translate: [number, number, number];
  };
}
// ─── Internal parsed structures ───────────────────────────────────────────────

export interface ParsedFace {
  vertexIndices: number[];
  uvIndices: number[] | null;
  surfaceType: SurfaceType;
}

export interface ParsedCityJson {
  vertices: [number, number, number][];
  uvPool: [number, number][];
  faces: ParsedFace[];
  hasTexture: boolean;
  textureImageUrl: string | null;
}

// ─── Renderer options ─────────────────────────────────────────────────────────

export interface CityJsonRendererOptions {
  colors?: Partial<Record<SurfaceType, string>>;
  lod?: string | number;
  enableTexture?: boolean;
  themeName?: string;
}

// ─── Hook return ──────────────────────────────────────────────────────────────

export interface SurfaceStats {
  type: SurfaceType;
  faceCount: number;
  mesh: THREE.Mesh;
}

export interface UseCityJsonRendererReturn {
  group: THREE.Group | null;
  isLoading: boolean;
  error: Error | null;
  surfaceStats: SurfaceStats[];
}
