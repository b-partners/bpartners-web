import { AreaPictureDetails, FileType } from '@bpartners/typescript-client';
import { useEffect, useState } from 'react';
import { useQuery } from 'react-query';
import { ConverterPayloadGeoJSON } from 'src/operations/annotator';
import { polygonConverterProvider, polygonMapper } from 'src/providers';
import { getFileUrl } from '../utils';

interface PolygonMarkerFetcher {
  areaPictureDetails: AreaPictureDetails | null;
}

export const usePolygonMarkerFetcher = ({ areaPictureDetails }: PolygonMarkerFetcher) => {
  const [imageSize, setImageSize] = useState(0);

  useEffect(() => {
    if (areaPictureDetails) {
      const { fileId } = areaPictureDetails;
      const image = new Image();
      image.src = getFileUrl(fileId, FileType.AREA_PICTURE);
      image.onload = () => {
        setImageSize(image.naturalWidth);
      };
    }
  }, [areaPictureDetails]);

  const query = useQuery({
    queryKey: ['usePolygonMarkerFetcher'],
    queryFn: async () => {
      const {
        filename,
        xTile: x_tile,
        yTile: y_tile,

        zoom: { number: zoom },
      } = areaPictureDetails;
      const geoJson: ConverterPayloadGeoJSON = polygonMapper.toRest(areaPictureDetails.geoPositions, { filename, image_size: imageSize, x_tile, y_tile, zoom });
      return await polygonConverterProvider.coordinatesToPixel(geoJson);
    },
    enabled: !!areaPictureDetails && imageSize > 0,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  return query;
};
