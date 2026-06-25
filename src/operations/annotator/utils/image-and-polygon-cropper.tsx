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

/** Restricts a value to the inclusive `[min, max]` range. */
const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

/**
 * Computes the axis-aligned bounding box that encloses every point of the given polygons,
 * in original image pixel coordinates. Returns a zeroed box when there are no points.
 */
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

/**
 * Builds the crop rectangle (in original image coordinates) that recenters the polygons
 * with a margin clamped to `[MIN_CROP_MARGIN, MAX_CROP_MARGIN]` and clamped to the image bounds,
 * so the crop never overflows the image.
 */
export const getCropRegion = (polygons: DomainPolygonResultType[], imageWidth: number, imageHeight: number, margin = MAX_CROP_MARGIN): CropRegion => {
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

type Coordinate = { x: number; y: number };
type WithMeasurements = { measurements?: { position?: Coordinate }[] };
type WithPoints = { points?: Coordinate[] } & WithMeasurements;

/** Adds `offsetX`/`offsetY` to a point while preserving any extra fields it carries. */
const translatePoint = <T extends Coordinate>({ x, y, ...rest }: T, offsetX: number, offsetY: number): T => ({ ...rest, x: x + offsetX, y: y + offsetY }) as T;

/**
 * Translates a polygon's `points` and its `measurements` label positions by the given offset.
 * No scaling is applied, so polygon sizes and measurement values are preserved. `measurements`
 * is only rewritten when present, leaving polygons without measurements untouched.
 */
const translatePolygon = <T extends WithPoints>(polygon: T, offsetX: number, offsetY: number): T => ({
  ...polygon,
  points: (polygon?.points ?? []).map(point => translatePoint(point, offsetX, offsetY)),
  ...(polygon?.measurements && {
    measurements: polygon.measurements.map(measurement => ({
      ...measurement,
      ...(measurement?.position && { position: translatePoint(measurement.position, offsetX, offsetY) }),
    })),
  }),
});

/**
 * Translates polygon points and measurement positions from original image space into the cropped
 * image space by subtracting the crop origin.
 */
export const cropPolygons = <T extends WithPoints>(polygons: T[], cropRegion: CropRegion): T[] =>
  (polygons ?? []).map(polygon => translatePolygon(polygon, -cropRegion.x, -cropRegion.y));

/**
 * Inverse of {@link cropPolygons}: maps polygon points and measurement positions from the cropped
 * image space back to the original image space by adding the crop origin.
 */
export const restorePolygons = <T extends WithPoints>(polygons: T[], cropRegion: CropRegion): T[] =>
  (polygons ?? []).map(polygon => translatePolygon(polygon, cropRegion.x, cropRegion.y));

/**
 * Draws the crop region of the source image 1:1 onto a canvas (no scaling) and returns it
 * as a PNG data URL.
 */
export const cropImage = (image: HTMLImageElement, cropRegion: CropRegion): string => {
  const canvas = document.createElement('canvas');
  canvas.width = cropRegion.width;
  canvas.height = cropRegion.height;

  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
  ctx.drawImage(image, cropRegion.x, cropRegion.y, cropRegion.width, cropRegion.height, 0, 0, cropRegion.width, cropRegion.height);

  return canvas.toDataURL('image/png');
};

/**
 * Loads the image from `imageUrl`, crops it around `polygonsForBoundingBox`, and returns the
 * cropped PNG data URL together with the polygons mapped into the cropped space and the
 * `cropRegion` needed to restore them later via {@link restorePolygons}.
 */
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
