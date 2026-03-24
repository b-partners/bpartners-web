import { Polygon } from '@bpartners/annotator-component';
import { AreaPictureDetails } from '@bpartners/typescript-client';
import { getAreaPictureShiftForZoom } from './get-areapicture-shift-for-zoom';

export const getCurrentShift = (areaPictureDetails: AreaPictureDetails) => {
  const direction = areaPictureDetails?.shiftDirection;
  const shift = areaPictureDetails?.shiftNb || 0;

  console.log({ shift, direction });

  const xShift = direction === 'RIGHT_LEFT_SIDE' ? shift * getAreaPictureShiftForZoom(areaPictureDetails.zoom.number) : 0;
  const yShift = direction === 'UP_DOWN_SIDE' ? shift * getAreaPictureShiftForZoom(areaPictureDetails.zoom.number) : 0;

  return { yShift, xShift };
};

/**
 * Function to add shift offset to polygons based on the current areaPictureDetails
 * @param polygons
 * @param areaPictureDetails
 * @param unShift if true, remove the offset
 * @returns
 */
export const shiftPolygons = (polygons: Polygon[], areaPictureDetails: AreaPictureDetails, unShift = false) => {
  const { xShift, yShift } = getCurrentShift(areaPictureDetails);

  return (polygons || []).map(p => ({
    ...p,
    points: p.points.map(point => ({ x: point.x + (unShift ? -xShift : xShift), y: point.y + (unShift ? -yShift : yShift) })),
  }));
};
