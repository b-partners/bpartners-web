import { ConverterPayloadGeoJSON } from '@/operations/annotator';
import { cache, geojsonMapper, getCached, polygonConverterProvider, polygonMapper } from '@/providers';
import { AreaPictureDetails, FileType } from '@bpartners/typescript-client';
import { useMutation } from '@tanstack/react-query';
import { getFileUrl } from '../utils';

const defaultImageShiftSize = 256;

const getImageSize = async (fileId: string) =>
  new Promise<number>((resolve, reject) => {
    try {
      const image = new Image();
      image.src = getFileUrl(fileId, FileType.AREA_PICTURE);
      image.onload = () => {
        resolve(image.naturalWidth);
      };
    } catch (err) {
      reject(err as Error);
    }
  });

const setMarkerOffset = (areaPictureDetails: AreaPictureDetails, currentImageSize: number) => {
  const { imageSize, markerPosition } = getCached.initialMarker(areaPictureDetails.id) || {};
  const { x, y } = markerPosition || {};

  const offset = (currentImageSize - imageSize) / 2;
  const horizontalShift = (areaPictureDetails.shiftNb || 0) * defaultImageShiftSize;

  return {
    x: x + offset + horizontalShift,
    y: y + offset,
  };
};

export const usePolygonMarkerFetcher = () => {
  const mutation = useMutation({
    mutationKey: ['usePolygonMarkerFetcher'],
    mutationFn: async (areaPictureDetails: AreaPictureDetails) => {
      if (!areaPictureDetails) return null;
      const {
        filename,
        xTile: x_tile,
        yTile: y_tile,
        zoom: { number: zoom },
      } = areaPictureDetails;
      const image_size = await getImageSize(areaPictureDetails.fileId);
      const geoJson: ConverterPayloadGeoJSON = polygonMapper.toRest(areaPictureDetails.geoPositions, { filename, image_size, x_tile, y_tile, zoom });
      const markerPoint = ((await polygonConverterProvider.coordinatesToPixel(geoJson)) || [null])[0];
      const mappedPoint = geojsonMapper.toMarker(markerPoint)[0];
      if (!areaPictureDetails.isExtended) {
        cache.initialMarker(areaPictureDetails.id, mappedPoint, image_size);
        return mappedPoint;
      } else {
        return setMarkerOffset(areaPictureDetails, image_size);
      }
    },
  });

  return { ...mutation, data: mutation.data };
};
