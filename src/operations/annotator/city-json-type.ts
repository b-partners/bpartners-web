export type CityJSON = {
  type: 'CityJSON';
  version: string;
  CityObjects: Record<string, CityObject>;
  transform: {
    scale: number[];
    translate: number[];
  };
  vertices: number[][];
};

type CityObject = {
  type: string;
  geometry: Geometry[];
};

type Geometry = {
  type: string;
  lod?: string | number;
  boundaries: number[][][];
  semantics?: {
    surfaces: SemanticSurface[];
    values: number[];
  };
};

type SemanticSurface =
  | {
      type: 'RoofSurface';
      slope_in_degrees: number;
      area_in_square_meters: number;
    }
  | {
      type: 'WallSurface';
      area_in_square_meters: number;
      height_in_meters: number;
    }
  | {
      type: 'GroundSurface';
    };
