import { Point } from '@bpartners/typescript-client';

export const isRoofPolygon = (points: Point[]) => {
  if (points.length !== 3) return false;
  if (points[0].x === 0 && points[0].y === 0 && points[1].x === 1 && points[1].y === 1 && points[2].x === 0 && points[2].y === 0) return true;
  return false;
};
