import { useMutation } from 'react-query';
import { ConverterGeoJSON } from 'src/operations/annotator';
import { polygonConverterProvider } from 'src/providers';

interface PolygonMarkerFetcher {
  markerPosition: ConverterGeoJSON;
}

export const usePolygonMarkerFetcher = () => {
  const query = useMutation({
    mutationKey: ['usePolygonReferencerFetcher'],
    mutationFn: async ({ markerPosition }: PolygonMarkerFetcher) => await polygonConverterProvider.coordinatesToPixel(markerPosition),
  });

  return query;
};
