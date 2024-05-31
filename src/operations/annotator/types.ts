import { Polygon } from '@bpartners/annotator-component';

export interface AnnotationInfo {
  labelType?: string;
  covering?: string;
  slope?: number;
  wearLevel?: number;
  obstacle?: string;
  comment?: string;
}

export type PolygonsForm = Record<`${number}`, Polygon>;

export type AnnotationsInfo = Record<`${number}`, AnnotationInfo>;

export type NumberAsString = `${number}`;
