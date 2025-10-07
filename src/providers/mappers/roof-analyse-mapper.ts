import { detectionResultColors } from '@/operations/prospects/constants';

import { getColorFromMain, Point, Polygon } from '@bpartners/annotator-component';
import { v4 } from 'uuid';
import { AnnotationCoveringFromAnalyse } from './annotation-covering-mapper';

export type ShiftNbDomainType = Point;

export type DomainPolygonType = Polygon & { shiftNb?: ShiftNbDomainType };

export type DomainPolygonResultType = Polygon & { label: keyof typeof detectionResultColors };

export type DetectionResultInVgg = Record<string, DetectionResult>;

export type SlopeAndHeightStatus = 'AVAILABLE' | 'UNAVAILABLE' | 'EXTRACTION_ERROR';

export interface DetectionResult {
  size: null;
  filename: string;
  base64_img_data: null;
  properties: Properties;
  regions: { [key: string]: Region };
}

export interface Properties {
  usure_rate: number;
  global_rate_value: number;
  global_rate_type: string;
  moisissure_rate: number;
  humidite_rate: number;
  roof_area_in_m2: number;
  revetement_1: AnnotationCoveringFromAnalyse;
  revetement_2: AnnotationCoveringFromAnalyse | null;
  roof_height_data_status: SlopeAndHeightStatus;
  roof_slope_data_status: SlopeAndHeightStatus;
  roof_slope_in_degrees: number;
  roof_height_in_meters: number;
}

export interface Region {
  shape_attributes: ShapeAttributes;
  region_attributes: RegionAttributes;
}

export interface RegionAttributes {
  label: keyof typeof detectionResultColors;
  confidence: null;
}

export interface ShapeAttributes {
  name: string;
  all_points_x: number[];
  all_points_y: number[];
}

export const detectionResultMapper = {
  toPolygon(regions: Region[], filterByLabel = true) {
    const polygons: DomainPolygonResultType[] = [];

    const availableLabels = Object.keys(detectionResultColors);

    const filteredRegions = filterByLabel ? regions.filter(({ region_attributes: { label } }) => availableLabels.includes(label)) : regions;

    filteredRegions.forEach(({ shape_attributes: { all_points_x, all_points_y }, region_attributes: { label } }) => {
      const points: DomainPolygonResultType['points'] = all_points_x.map((x, yIndex) => ({ x, y: all_points_y[yIndex] }));

      const polygon: DomainPolygonResultType = {
        id: v4(),
        label,
        points,
        ...getColorFromMain(detectionResultColors[label]),
      };

      polygons.push(polygon);
    });

    return polygons;
  },
};
