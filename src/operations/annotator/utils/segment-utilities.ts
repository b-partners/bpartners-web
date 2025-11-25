import { Point } from '@bpartners/annotator-component';

export const getDistance = (p1: number[], p2: number[]) => {
  const [x1, y1, z1] = p1;
  const [x2, y2, z2] = p2;
  return Math.hypot(x2 - x1, y2 - y1, z2 - z1);
};

export const getCenter = (p1: Point, p2: Point) => {
  const { x: x1, y: y1 } = p1;
  const { x: x2, y: y2 } = p2;
  return {
    x: (x1 + x2) / 2,
    y: (y1 + y2) / 2,
  };
};
