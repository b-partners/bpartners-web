import { Polygon, PolygonColor } from '@bpartners/annotator-component';

const POLYGON_COLORS: PolygonColor[] = [
  { fillColor: '#E91E6340', strokeColor: '#E91E63' },
  { fillColor: '#FFC10740', strokeColor: '#FFC107' },
  { fillColor: '#0E4EB340', strokeColor: '#0E4EB3' },
  { fillColor: '#FF572240', strokeColor: '#FF5722' },
  { fillColor: '#00ff0040', strokeColor: '#00ff00' },
  { fillColor: '#CDDC3940', strokeColor: '#CDDC39' },
  { fillColor: '#2196F340', strokeColor: '#2196F3' },
  { fillColor: '#E91E6340', strokeColor: '#E91E63' },
  { fillColor: '#8A2BE240', strokeColor: '#8A2BE2' },
  { fillColor: '#00BCD440', strokeColor: '#00BCD4' },
];

export const getNewPolygonColor = (polygons: Polygon[]) => {
  if (polygons.length === 0) {
    return { fillColor: '#00000000', strokeColor: '#000000' };
  }

  const currentIndex = (polygons.length % POLYGON_COLORS.length) - 1;
  const lastPolygon = polygons[polygons.length - 1];

  // If the new color would match the last polygon's color, increment the index
  let nextIndex = currentIndex;
  if (POLYGON_COLORS[currentIndex]?.strokeColor === lastPolygon?.strokeColor) {
    nextIndex = (currentIndex + 1) % POLYGON_COLORS.length;
  }

  return POLYGON_COLORS[nextIndex] || POLYGON_COLORS[0];
};
