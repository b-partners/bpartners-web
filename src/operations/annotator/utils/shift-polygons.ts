import { Polygon } from '@bpartners/annotator-component';
import { AreaPictureDetails } from '@bpartners/typescript-client';

const shiftForZoom = {
  20: 256,
  19: 1024,
  18: 1024 * 2,
};

const getShift = (zoom: number) => (zoom in shiftForZoom ? shiftForZoom[zoom as keyof typeof shiftForZoom] : 0);

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
  const xShift = direction === 'RIGHT_LEFT_SIDE' ? shift * getShift(areaPictureDetails.zoom.number) : 0;
  const yShift = direction === 'UP_DOWN_SIDE' ? shift * getShift(areaPictureDetails.zoom.number) : 0;

  return (polygons || []).map(p => ({
    ...p,
    points: p.points.map(point => ({ x: point.x + (unShift ? -xShift : xShift), y: point.y + (unShift ? -yShift : yShift) })),
  }));
};
