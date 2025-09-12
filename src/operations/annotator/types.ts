import { AnnotationCoveringType, AnnotationLabelsType, AnnotationWearType } from '@/constants';
import { Polygon, ScaleCallbacks } from '@bpartners/annotator-component';
import { SxProps } from '@mui/material';

export interface AnnotationInfo {
  polygonId?: string;
  labelType?: keyof AnnotationLabelsType;
  covering?: keyof AnnotationCoveringType;
  covering2?: keyof AnnotationCoveringType;
  slope?: number;
  wearLevel?: number;
  obstacle?: string;
  comment?: string;
  wear?: keyof AnnotationWearType;
  moldRate?: number;
  fillColor?: string;
  strokeColor?: string;
  labelName?: string;
  humidityLevel?: number;
  height?: number;
}

export type PolygonsForm = Record<`${number}`, Polygon>;

export type AnnotationsInfo = Record<`${number}`, AnnotationInfo>;

export type NumberAsString = `${number}`;

export type RefocusImageButtonProps = {
  onAccept: () => void;
  isLoading?: boolean;
  isExtended?: boolean;
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
  showAddress?: boolean;
  polygons?: Polygon[];
  width?: number | string;
  height?: number;
  buttonComponent?: (callback: ScaleCallbacks) => React.ReactNode;
  showFileSource?: boolean;
  boxWrapperSx?: SxProps;
  draftAnnotationId?: string;
  defaultAnnotationInfos?: AnnotationInfo[];
}
