import { cache, DomainPolygonResultType } from '@/providers';
const margin = 10;

export const getBoundingBox = (polygons: DomainPolygonResultType[]) => {
  const { x: firstX, y: firstY } = polygons[0].points[0];
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

export const getBoundingBoxSize = (boundingBox: ReturnType<typeof getBoundingBox>, imageXSize: number, imageYSize: number) => {
  const xSize = boundingBox.right - boundingBox.left;
  const ySize = boundingBox.bottom - boundingBox.top;

  const result = { boundingBoxXSize: 1024, boundingBoxYSize: 1024 };

  if (xSize < 1024 && ySize < 1024) return result;
  if (xSize < ySize) {
    result.boundingBoxYSize = ySize;
    if (imageXSize < ySize) result.boundingBoxXSize = imageXSize;
    else result.boundingBoxXSize = ySize;
  } else {
    result.boundingBoxXSize = xSize;
    if (imageYSize < xSize) result.boundingBoxYSize = imageYSize;
    else result.boundingBoxYSize = xSize;
  }

  const marginOffsetX = imageXSize - result.boundingBoxXSize;
  const marginOffsetY = imageYSize - result.boundingBoxYSize;

  result.boundingBoxXSize += marginOffsetX >= margin ? margin : marginOffsetX;
  result.boundingBoxYSize += marginOffsetY >= margin ? margin : marginOffsetY;

  return result;
};

export const getOriginPoint = (boundingBox: ReturnType<typeof getBoundingBox>, xSize: number, ySize: number, imageXSize: number, imageYSize: number) => {
  const xOffset = (xSize - (boundingBox.right - boundingBox.left)) / 2;
  const yOffset = (ySize - (boundingBox.bottom - boundingBox.top)) / 2;

  const x0 = boundingBox.left - xOffset;
  const x1 = boundingBox.right + xOffset;
  const y0 = boundingBox.top - yOffset;
  const y1 = boundingBox.bottom + yOffset;

  const positionZero = {
    x: x0,
    y: y0,
  };

  if (x1 > imageXSize) positionZero.x = x0 - (x1 - imageXSize);
  else if (x0 < 0) positionZero.x = 0;

  if (y1 > imageYSize) positionZero.y = y0 - (y1 - imageYSize);
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

export const createImage = async (url: string): Promise<HTMLImageElement> =>
  new Promise(resolve => {
    const img = new Image();
    img.src = url;
    img.onload = () => {
      resolve(img);
    };
  });

export const getCroppedImageAndPolygons = (polygons: DomainPolygonResultType[], polygonsForBoundingBox: DomainPolygonResultType[], image: HTMLImageElement) => {
  const canvas = document.createElement('canvas');

  const boundingBox = getBoundingBox(polygonsForBoundingBox);
  const boundingBoxSize = getBoundingBoxSize(boundingBox, image.width, image.height);
  const { boundingBoxXSize, boundingBoxYSize } = boundingBoxSize;
  const originPoint = getOriginPoint(boundingBox, boundingBoxXSize, boundingBoxYSize, image.width, image.height);

  canvas.height = boundingBoxYSize > 1024 ? 1024 : boundingBoxYSize;
  canvas.width = boundingBoxXSize > 1024 ? 1024 : boundingBoxXSize;

  const xScale = canvas.width / boundingBoxXSize;
  const yScale = canvas.height / boundingBoxYSize;

  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
  ctx.drawImage(image, originPoint.x, originPoint.y, boundingBoxXSize, boundingBoxYSize, 0, 0, canvas.width, canvas.height);

  const newImage = canvas.toDataURL('image/png');
  const newPolygons = polygons.map(p => ({ ...p, points: p.points.map(({ x, y }) => ({ x: (x - originPoint.x) * xScale, y: (y - originPoint.y) * yScale })) }));
  cache.currentImageSize(canvas.width);
  return {
    polygons: newPolygons,
    image: newImage,
  };
};
