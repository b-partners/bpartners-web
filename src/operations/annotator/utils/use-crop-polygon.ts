import { cache, DomainPolygonResultType } from '@/providers';
const MARGIN_RATIO = 0.08;
const MAX_CANVAS_SIZE = 1024;

export const getBoundingBox = (polygons: DomainPolygonResultType[]) => {
  const validPolygons = (polygons ?? []).filter(polygon => polygon?.points?.length);
  const { x: firstX, y: firstY } = validPolygons[0]?.points[0] ?? { x: 0, y: 0 };
  const boundingBox = {
    left: firstX,
    right: firstX,
    top: firstY,
    bottom: firstY,
  };

  validPolygons.forEach(({ points }) => {
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

  let side = Math.max(xSize, ySize);
  side = Math.ceil(side * (1 + MARGIN_RATIO * 2));
  side = Math.max(side, MAX_CANVAS_SIZE);

  return {
    boundingBoxXSize: Math.min(side, imageXSize),
    boundingBoxYSize: Math.min(side, imageYSize),
  };
};

export const getOriginPoint = (boundingBox: ReturnType<typeof getBoundingBox>, xSize: number, ySize: number, imageXSize: number, imageYSize: number) => {
  const centerX = (boundingBox.left + boundingBox.right) / 2;
  const centerY = (boundingBox.top + boundingBox.bottom) / 2;

  const maxX = Math.max(0, imageXSize - xSize);
  const maxY = Math.max(0, imageYSize - ySize);

  return {
    x: Math.min(Math.max(centerX - xSize / 2, 0), maxX),
    y: Math.min(Math.max(centerY - ySize / 2, 0), maxY),
  };
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

  const boundingBox = getBoundingBox([...(polygonsForBoundingBox ?? []), ...(polygons ?? [])]);
  const boundingBoxSize = getBoundingBoxSize(boundingBox, image.width, image.height);
  const { boundingBoxXSize, boundingBoxYSize } = boundingBoxSize;
  const originPoint = getOriginPoint(boundingBox, boundingBoxXSize, boundingBoxYSize, image.width, image.height);

  canvas.height = Math.min(boundingBoxYSize, MAX_CANVAS_SIZE);
  canvas.width = Math.min(boundingBoxXSize, MAX_CANVAS_SIZE);

  const xScale = canvas.width / boundingBoxXSize;
  const yScale = canvas.height / boundingBoxYSize;

  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
  ctx.drawImage(image, originPoint.x, originPoint.y, boundingBoxXSize, boundingBoxYSize, 0, 0, canvas.width, canvas.height);

  const newImage = canvas.toDataURL('image/png');
  const newPolygons = polygons.map(p => ({
    ...p,
    points: (p?.points ?? []).map(({ x, y }) => ({ x: (x - originPoint.x) * xScale, y: (y - originPoint.y) * yScale })),
  }));
  cache.currentImageSize(canvas.width);
  return {
    polygons: newPolygons,
    image: newImage,
  };
};
