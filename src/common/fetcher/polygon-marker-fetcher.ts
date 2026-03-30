import { ConverterPayloadGeoJSON } from '@/operations/annotator';
import { geojsonMapper, polygonConverterProvider, polygonMapper } from '@/providers';
import { Point } from '@bpartners/annotator-component';
import { AreaPictureDetails, ShiftDirection } from '@bpartners/typescript-client';
import { useMutation } from '@tanstack/react-query';

const defaultImageShiftSize = 1024;

const shouldShift = (areaPictureDetails: AreaPictureDetails, shiftDirection: ShiftDirection) => (areaPictureDetails.shiftDirection === shiftDirection ? 1 : 0);

const setMarkerOffset = (areaPictureDetails: AreaPictureDetails, markerPosition: Point) => {
  const { x, y } = markerPosition || {};

  const shift = (areaPictureDetails.shiftNb || 0) * defaultImageShiftSize;

  const horizontalShift = shouldShift(areaPictureDetails, 'RIGHT_LEFT_SIDE') * shift;
  const verticalShift = shouldShift(areaPictureDetails, 'UP_DOWN_SIDE') * shift;

  return {
    x: x - horizontalShift,
    y: y - verticalShift,
  };
};

export const usePolygonMarkerFetcher = () => {
  const mutation = useMutation({
    mutationKey: ['usePolygonMarkerFetcher'],
    onError: console.log,
    mutationFn: async (areaPictureDetails: AreaPictureDetails) => {
      if (!areaPictureDetails) return null;
      const {
        filename,
        currentTile,
        zoom: { number: zoom },
      } = areaPictureDetails;

      const { x: xTile, y: yTile } = currentTile || {};

      const image_size = 1024;
      const geoJson: ConverterPayloadGeoJSON = polygonMapper.toRest([areaPictureDetails.currentGeoPosition], {
        filename,
        image_size,
        x_tile: xTile - 1,
        y_tile: yTile - 1,
        zoom,
      });
      const markerPoint = await polygonConverterProvider.coordinatesToPixel(geoJson);
      const mappedPoint = geojsonMapper.toMarker(markerPoint)[0];

      if (!areaPictureDetails.isExtended) {
        return {
          x: image_size / 2,
          y: image_size / 2,
        };
      }

      return setMarkerOffset(areaPictureDetails, { x: mappedPoint.x, y: mappedPoint.y });
    },
  });

  return { ...mutation, data: mutation.data };
};
