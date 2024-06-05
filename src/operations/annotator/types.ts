import { Polygon } from '@bpartners/annotator-component';

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
}

export type PolygonsForm = Record<`${number}`, Polygon>;

export type AnnotationsInfo = Record<`${number}`, AnnotationInfo>;

export type NumberAsString = `${number}`;

export type RefocusDialogProps = {
  onAccept: () => void;
  isLoading?: boolean;
  disabled?: boolean;
};
