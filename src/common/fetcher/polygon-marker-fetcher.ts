import { ConverterPayloadGeoJSON } from '@/operations/annotator';
import { geojsonMapper, polygonConverterProvider, polygonMapper } from '@/providers';
import { AreaPictureDetails, FileType } from '@bpartners/typescript-client';
import { useMutation } from 'react-query';
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
      return await polygonConverterProvider.coordinatesToPixel(geoJson);
    },
  });
  return { ...mutation, data: geojsonMapper.toMarker((mutation.data || [null])[0])[0] };
};
