import { analyseGeneratedIdRef } from '@/operations/prospects/constants';
import { Polygon } from '@bpartners/annotator-component';

/**
 * check if
 */
export const isAfterAnalyse = (polygonList: Polygon[]) => !!polygonList.find(polygon => polygon.id.includes(analyseGeneratedIdRef));
