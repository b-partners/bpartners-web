import { ConverterPayloadGeoJSON } from '@/operations/annotator';
import { geojsonMapper, polygonConverterProvider, polygonMapper } from '@/providers';
import { Point } from '@bpartners/annotator-component';
import { AreaPictureDetails, FileType } from '@bpartners/typescript-client';
import { useMutation } from '@tanstack/react-query';
import { getFileUrl } from '../utils';

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

const defaultOffset = 1024 * 3;
const setMarkerOffset = (point: Point, isExtended: boolean) => {
  const { x, y } = point || {};
  let offset = 0;
  if (isExtended) offset = defaultOffset;

  return {
    x: x + offset,
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
      return setMarkerOffset(mappedPoint, areaPictureDetails.isExtended);
    },
  });

  return { ...mutation, data: mutation.data };
};
