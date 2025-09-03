import { Polygon } from '@bpartners/annotator-component';

export const createRoofPolygon = (area = 0, polygons: Polygon[] = []) => {
  return [{ fillColor: '', id: 'roof-polygon', points: [{x: 0, y: 0}, {x: 1, y: 1}, {x: 0, y: 0}], isInvisible: false, strokeColor: '', surface: +area.toFixed(2) }, ...polygons];
};
