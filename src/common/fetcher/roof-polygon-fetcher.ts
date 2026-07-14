import { annotatorStore } from '@/common/store';
import { ConverterPayloadGeoJSON } from '@/operations/annotator';
import { roofGlobalIdRef } from '@/operations/prospects/constants';
import { geoShapeAttributesToPoints, polygonConverterProvider, polygonMapper } from '@/providers';
import { Polygon } from '@bpartners/annotator-component';
import { AreaPictureDetails, GeoPosition } from '@bpartners/typescript-client';
import { useMutation } from '@tanstack/react-query';
import { v4 } from 'uuid';

const defaultImageSize = 1024;

interface RoofPolygonFetcherPayload {
  areaPictureDetails: AreaPictureDetails;
  geoJson: any;
}

const toGeoPositions = (geoJson: any): GeoPosition[] => {
  const ring = geoJson?.geometry?.coordinates?.[0]?.[0] || [];
  return ring.map(([longitude, latitude]: [number, number]) => ({ longitude, latitude }));
};

export const useRoofPolygonFetcher = () => {
  const mutation = useMutation({
    mutationKey: ['useRoofPolygonFetcher'],
    onError: console.log,
    mutationFn: async ({ areaPictureDetails, geoJson }: RoofPolygonFetcherPayload) => {
      if (!areaPictureDetails || !geoJson) return null;
      const {
        filename,
        currentTile,
        zoom: { number: zoom },
      } = areaPictureDetails;

      const { x: xTile, y: yTile } = currentTile || {};

      const payload: ConverterPayloadGeoJSON = polygonMapper.toRest(toGeoPositions(geoJson), {
        filename,
        image_size: defaultImageSize,
        x_tile: xTile - 1,
        y_tile: yTile - 1,
        zoom,
      });

      const pixelResult = await polygonConverterProvider.coordinatesToPixel(payload);
      const shapeAttributes = Object.values(pixelResult?.[0]?.regions || {})[0]?.shape_attributes;
      if (!shapeAttributes) return null;

      const roofPolygon: Polygon = {
        id: `${v4()}__${roofGlobalIdRef}`,
        points: geoShapeAttributesToPoints(shapeAttributes),
        fillColor: '#00ff0000',
        strokeColor: '#00ff00',
      };

      annotatorStore.useAnnotatorStore.getState().addPolygon(roofPolygon);
      return roofPolygon;
    },
  });

  return { ...mutation, data: mutation.data };
};
