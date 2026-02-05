import { Polygon } from '@bpartners/annotator-component';
import { AreaPictureDetails } from '@bpartners/typescript-client';

/**
 * Function to add shift offset to polygons based on the current areaPictureDetails
 * @param polygons
 * @param areaPictureDetails
 * @param unShift if true, remove the offset
 * @returns
 */
export const shiftPolygons = (polygons: Polygon[], areaPictureDetails: AreaPictureDetails, unShift = false) => {
  const direction = areaPictureDetails?.shiftDirection;
  const shift = areaPictureDetails?.shiftNb || 0;
  const xShift = direction === 'RIGHT_LEFT_SIDE' ? shift * 1024 : 0;
  const yShift = direction === 'UP_DOWN_SIDE' ? shift * 1024 : 0;

  return (polygons || []).map(p => ({
    ...p,
    points: p.points.map(point => ({ x: point.x + (unShift ? -xShift : xShift), y: point.y + (unShift ? -yShift : yShift) })),
  }));
};
