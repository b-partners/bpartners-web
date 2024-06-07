import { Point } from '@bpartners/annotator-component';

export const pointsMapper = {
  geoPointToPolygonPoint(x: number, y: number) {
    return {
      x,
      y,
    } as Point;
  },

  geoPointsToPolygonPoints(xPointList: number[], yPointList: number[]) {
    if (xPointList.length !== yPointList.length) {
      throw new Error('Incompatible x and y points list');
    }
    const polygonPoints: Point[] = xPointList.map((x, index) => ({ x, y: yPointList[index] }));
    return polygonPoints;
  },
};
