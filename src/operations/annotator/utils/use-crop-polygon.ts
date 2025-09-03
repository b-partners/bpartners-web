import { DomainPolygonResultType } from '@/providers';

export const getBoundingBox = (polygons: DomainPolygonResultType[]) => {
  const { x: firstX, y: firstY } = polygons?.[0]?.points?.[0] || { x: 0, y: 0 };
  const boundingBox = {
    left: firstX,
    right: firstX,
    top: firstY,
    bottom: firstY,
  };

  polygons.forEach(({ points }) => {
    points.forEach(({ x, y }) => {
      if (x < boundingBox.left) boundingBox.left = x;
      if (x > boundingBox.right) boundingBox.right = x;
      if (y < boundingBox.top) boundingBox.top = y;
      if (y > boundingBox.bottom) boundingBox.bottom = y;
    });
  });

  return boundingBox;
};

export const getBoundingBoxSize = (boundingBox: ReturnType<typeof getBoundingBox>) => {
  const margin = 10;
  const xSize = boundingBox.right - boundingBox.left;
  const ySize = boundingBox.bottom - boundingBox.top;
  if (xSize < 1024 && ySize < 1024) return 1034;
  if (xSize < ySize) return ySize + margin;
  return xSize + margin;
};

export const getOriginPoint = (boundingBox: ReturnType<typeof getBoundingBox>, size: number, imageSize: number) => {
  const xOffset = (size - (boundingBox.right - boundingBox.left)) / 2;
  const yOffset = (size - (boundingBox.bottom - boundingBox.top)) / 2;

  const x0 = boundingBox.left - xOffset;
  const x1 = boundingBox.right + xOffset;
  const y0 = boundingBox.top - yOffset;
  const y1 = boundingBox.bottom + yOffset;

  const positionZero = {
    x: x0,
    y: y0,
  };

  if (x1 > imageSize) positionZero.x = x0 - (x1 - imageSize);
  else if (x0 < 0) positionZero.x = 0;

  if (y1 > imageSize) positionZero.y = y0 - (y1 - imageSize);
  else if (y0 < 0) positionZero.y = 0;

  return positionZero;
};

export const fetchImageAsBase64 = async (imageUrl: string): Promise<string> => {
  const response = await fetch(imageUrl);
  const blob = await response.blob();
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert image to base64'));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export const createImage = async (url: string) =>
  new Promise(resolve => {
    const img = new Image();
    img.src = url;
    img.onload = () => {
      resolve(img);
    };
  });

export const getCropepedImageAndPolygons = (
  polygons: DomainPolygonResultType[],
  polygonsForBoundingBox: DomainPolygonResultType[],
  image: HTMLImageElement
) => {
  const canvas = document.createElement('canvas');

  const boundingBox = getBoundingBox(polygonsForBoundingBox);
  const boundingBoxSize = getBoundingBoxSize(boundingBox);
  const originPoint = getOriginPoint(boundingBox, boundingBoxSize, image.width);

  canvas.height = boundingBoxSize;
  canvas.width = boundingBoxSize;

  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
  ctx.drawImage(image, originPoint.x, originPoint.y, boundingBoxSize, boundingBoxSize, 0, 0, boundingBoxSize, boundingBoxSize);

  const newImage = canvas.toDataURL('image/png');
  const newPolygons = polygons.map(p => ({ ...p, points: p.points.map(({ x, y }) => ({ x: x - originPoint.x, y: y - originPoint.y })) }));

  return {
    polygons: newPolygons,
    image: newImage,
  };
};
