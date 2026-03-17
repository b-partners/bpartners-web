import { Point } from '@bpartners/annotator-component';

const getCenter = (coordinates: number[]) => {
  if (!coordinates) return 0;
  const sumOfCoordinates = coordinates.reduce((prev, current) => prev + current, 0);
  return sumOfCoordinates / coordinates.length;
};

export const geojsonMapper = {
  toMarker(geoJson: any): Point[] {
    if (!geoJson || geoJson.length === 0) return [];
    const regions = geoJson[0]?.regions;

    return Object.keys(regions || {}).map(id => {
      const {
        shape_attributes: { all_points_x, all_points_y },
      } = regions[id];
      return { x: getCenter(all_points_x), y: getCenter(all_points_y) };
    });
  },
};
