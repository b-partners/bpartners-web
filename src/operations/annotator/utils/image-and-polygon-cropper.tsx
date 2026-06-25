/**
 * functions to handle image and polygon crop
 * inputs : image url and polygons
 *
 * the image can have square or rectangular for x can be equal to y or not
 * i need you to crop the image to recenter the polygon inside the image with max 50px margin and min 0px
 * i need the polygons cropped to fit the new image, (without changing the size, no scalling)
 * i need method to restore the polygons from cropped to the original
 */
import { DomainPolygonResultType } from '@/providers';
import { createImage, fetchImageAsBase64 } from './use-crop-polygon';

export const MAX_CROP_MARGIN = 50;
export const MIN_CROP_MARGIN = 0;

export interface CropRegion {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CropImageAndPolygonsResult {
  image: string;
  polygons: DomainPolygonResultType[];
  cropRegion: CropRegion;
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export const getPolygonsBoundingBox = (polygons: DomainPolygonResultType[]) => {
  const points = (polygons ?? []).flatMap(polygon => polygon?.points ?? []);
  if (points.length === 0) return { left: 0, top: 0, right: 0, bottom: 0 };

  const xs = points.map(({ x }) => x);
  const ys = points.map(({ y }) => y);

  return {
    left: Math.min(...xs),
    top: Math.min(...ys),
    right: Math.max(...xs),
    bottom: Math.max(...ys),
  };
};

export const getCropRegion = (
  polygons: DomainPolygonResultType[],
  imageWidth: number,
  imageHeight: number,
  margin = MAX_CROP_MARGIN
): CropRegion => {
  const safeMargin = clamp(margin, MIN_CROP_MARGIN, MAX_CROP_MARGIN);
  const boundingBox = getPolygonsBoundingBox(polygons);

  const left = clamp(boundingBox.left - safeMargin, 0, imageWidth);
  const top = clamp(boundingBox.top - safeMargin, 0, imageHeight);
  const right = clamp(boundingBox.right + safeMargin, 0, imageWidth);
  const bottom = clamp(boundingBox.bottom + safeMargin, 0, imageHeight);

  return {
    x: left,
    y: top,
    width: right - left,
    height: bottom - top,
  };
};

export const cropPolygons = (polygons: DomainPolygonResultType[], cropRegion: CropRegion): DomainPolygonResultType[] =>
  (polygons ?? []).map(polygon => ({
    ...polygon,
    points: (polygon?.points ?? []).map(({ x, y, ...rest }) => ({ ...rest, x: x - cropRegion.x, y: y - cropRegion.y })),
  }));

export const restorePolygons = (polygons: DomainPolygonResultType[], cropRegion: CropRegion): DomainPolygonResultType[] =>
  (polygons ?? []).map(polygon => ({
    ...polygon,
    points: (polygon?.points ?? []).map(({ x, y, ...rest }) => ({ ...rest, x: x + cropRegion.x, y: y + cropRegion.y })),
  }));

export const cropImage = (image: HTMLImageElement, cropRegion: CropRegion): string => {
  const canvas = document.createElement('canvas');
  canvas.width = cropRegion.width;
  canvas.height = cropRegion.height;

  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
  ctx.drawImage(image, cropRegion.x, cropRegion.y, cropRegion.width, cropRegion.height, 0, 0, cropRegion.width, cropRegion.height);

  return canvas.toDataURL('image/png');
};

export const cropImageAndPolygons = async (
  imageUrl: string,
  polygons: DomainPolygonResultType[],
  polygonsForBoundingBox: DomainPolygonResultType[] = polygons,
  margin = MAX_CROP_MARGIN
): Promise<CropImageAndPolygonsResult> => {
  const imageAsBase64 = await fetchImageAsBase64(imageUrl);
  const image = await createImage(imageAsBase64);

  const cropRegion = getCropRegion(polygonsForBoundingBox, image.width, image.height, margin);

  return {
    image: cropImage(image, cropRegion),
    polygons: cropPolygons(polygons, cropRegion),
    cropRegion,
  };
};
