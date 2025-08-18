import { Polygon } from '@bpartners/annotator-component';

export const createRoofPolygon = (area = 0, polygons: Polygon[] = []) => {
  return [{ fillColor: '', id: 'roof-polygon', points: [], isInvisible: false, strokeColor: '', surface: +area.toFixed(2) }, ...polygons];
};
