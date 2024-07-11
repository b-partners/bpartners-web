import { Point } from '@bpartners/annotator-component';
import { ConverterResultGeoJSON } from '@/operations/annotator';

const getCenter = (coordinates: number[]) => {
  if (!coordinates) return 0;
  const sumOfCoordinates = coordinates.reduce((prev, current) => prev + current, 0);
  return sumOfCoordinates / coordinates.length;
};

export const geojsonMapper = {
  toMarker(geoJson: ConverterResultGeoJSON): Point[] {
    if (!geoJson) return [];
    const { regions } = geoJson;

    return Object.keys(regions || {}).map(id => {
      const {
        shape_attributes: { all_points_x, all_points_y },
      } = regions[id];
      return { x: getCenter(all_points_x), y: getCenter(all_points_y) };
    });
  },
};
