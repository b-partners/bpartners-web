import { roofGlobalIdRef } from '@/operations/prospects/constants';
import { Polygon } from '@bpartners/annotator-component';
import { v4 } from 'uuid';

export const createRoofPolygon = (area = 0, polygons: Polygon[] = []) => {
  return [
    {
      fillColor: '',
      id: `${v4()}__${roofGlobalIdRef}`,
      points: [
        { x: 0, y: 0 },
        { x: 1, y: 1 },
        { x: 0, y: 0 },
      ],
      isInvisible: false,
      strokeColor: '',
      surface: +area.toFixed(2),
    },
    ...polygons,
  ];
};
