import { Measurement, Polygon } from '@bpartners/annotator-component';
import { ConverterResultGeoJSON } from 'src/operations/annotator';
import { pointsMapper } from './points-mapper';

interface PolygonMetadata {
  fillColor: string;
  strokeColor: string;
  measurements?: Measurement[];
  surface?: number;
}

export const geojsonMapper = {
  toPolygon(geoJson: ConverterResultGeoJSON, { fillColor, strokeColor, measurements, surface }: PolygonMetadata): Polygon[] {
    if (!geoJson) return [];
    const { regions } = geoJson;

    return Object.keys(regions).map(id => {
      const {
        shape_attributes: { all_points_x, all_points_y },
      } = regions[id];

      const points = pointsMapper.geoPointsToPolygonPoints(all_points_x, all_points_y);

      return {
        id,
        points,
        surface,
        fillColor,
        strokeColor,
        measurements,
        isInvisible: true,
      };
    });
  },
};
