import { shiftForZoom } from './constants';

export const getAreaPictureShiftForZoom = (zoom: number) => (zoom in shiftForZoom ? shiftForZoom[zoom as keyof typeof shiftForZoom] : 0);
