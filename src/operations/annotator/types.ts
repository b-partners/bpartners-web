import { Polygon } from '@bpartners/annotator-component';
import { AreaPictureAnnotationInstance } from '@bpartners/typescript-client';

type Wear = 'LOW' | 'PARTIAL' | 'ADVANCED' | 'EXTREME';

export interface AnnotationInfo {
  labelType?: string;
  covering?: string;
  slope?: number;
  wearLevel?: number;
  obstacle?: string;
  comment?: string;
  wear?: Wear;
  moldRate?: number;
  fillColor?: string;
  strokeColor?: string;
  labelName?: string;
}

export type PolygonsForm = Record<`${number}`, Polygon>;

export type AnnotationsInfo = Record<`${number}`, AnnotationInfo>;

export type NumberAsString = `${number}`;

export type RefocusImageButtonProps = {
  onAccept: () => void;
  isLoading?: boolean;
  isExtended?: boolean;
};

export type AnnotationInfoProps = {
  areaPictureAnnotationInstance: AreaPictureAnnotationInstance;
};

export type AnnotationInfoDetailsProps = {
  label?: string;
  value?: string | number;
  unity?: string;
};

export interface ConverterPayloadGeoJSON {
  properties: Properties;
  type: string;
  filename: string;
  x_tile: number;
  y_tile: number;
  geometry: Geometry;
  region_attributes: RegionAttributes;
  image_size: number;
  zoom: number;
}

export interface Geometry {
  type: string;
  coordinates: Array<Array<Array<number[]>>>;
}

export interface Properties {
  id: string;
}

export interface RegionAttributes {
  label: string;
}

export interface ConverterResultGeoJSON {
  filename: string;
  regions: Record<string, Region>;
  image_size: number;
  zoom: number;
  region_attributes: RegionAttributes;
  x_tile: number;
  y_tile: number;
}

export interface RegionAttributes {
  label: string;
}

export interface Region {
  id: string;
  shape_attributes: ShapeAttributes;
}

export interface ShapeAttributes {
  all_points_x: number[];
  all_points_y: number[];
  name: string;
}

export interface AnnotatorComponentProps {
  allowAnnotation?: boolean;
  allowSelect?: boolean;
  polygons?: Polygon[];
  width?: number;
  height?: number;
}
