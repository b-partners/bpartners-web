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

export type RefocusDialogProps = {
  onAccept: () => void;
  isLoading?: boolean;
  disabled?: boolean;
};

export type AnnotationInfoProps = {
  areaPictureAnnotationInstance: AreaPictureAnnotationInstance;
};

export type AnnotationInfoDetailsProps = {
  label?: string;
  value?: string | number;
  unity?: string;
};
