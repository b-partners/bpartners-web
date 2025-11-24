import { v4 as uuid } from 'uuid';
import { useQuery } from '@tanstack/react-query';
import { useAnnotatorComponentStore } from '../store';
import { getCityJSON } from '@/providers/city-json-provider';
import { stringifyObj } from '../utils/stringify';
import { Polygon } from '@bpartners/annotator-component';
import { annotatorProvider, cache, getCached, polygonMapper } from '@/providers';
import { AreaPictureDetails } from '@bpartners/typescript-client';

const mapPixelPolygonToLatLonPolygon = async (polygon: Polygon, areaPicture: AreaPictureDetails) => {
  const imageSize = 1024;
  const geoJson = polygonMapper.toRefererGeoJson(polygon, imageSize, areaPicture);
  const refererGeoJson: any = (await annotatorProvider.pointsToGeoPoints(geoJson as any)) || {};

  const regions = (Object.values(refererGeoJson)[0] as any)?.regions;
  const { all_points_x, all_points_y } = (Object.values(regions)[0] as any)?.shape_attributes || {};

  const coordinates: any[] = [];

  (all_points_x as any[])?.forEach((latitude, index) => {
    coordinates.push({ latitude, longitude: all_points_y[index] });
  });

  if (!refererGeoJson) return null;

  const mappedCoordinates: [number, number][] = [];

  (all_points_x as any[])?.forEach((x, index) => {
    if (index !== all_points_x.length - 1) mappedCoordinates.push([all_points_y[index], x]);
  });

  return mappedCoordinates;
};

export const useCitJSONProcessQuery = (polygonFromAnnotator?: Polygon, areaPicture?: AreaPictureDetails, active?: boolean) => {
  const { roofDelimiter } = useAnnotatorComponentStore();
  const hasRoofDelimiter = !!roofDelimiter?.polygon;
  const hasPolygonFromAnnotator = !!polygonFromAnnotator;

  return useQuery({
    enabled: active && (hasRoofDelimiter || hasPolygonFromAnnotator),
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const cachedCityJSONRequestId = getCached.cityJSONRequestId();
      const cityJSONRequestId = cachedCityJSONRequestId || uuid();

      cache.cityJSONRequestId(cityJSONRequestId);
     
      //TODO: maybe handle roof delimiter
      const mappedCoordinates = await mapPixelPolygonToLatLonPolygon(polygonFromAnnotator, areaPicture);
      return getCityJSON(cityJSONRequestId, mappedCoordinates);
    },
    queryKey: [
      'city-json',
      stringifyObj(roofDelimiter ?? {}),
      hasRoofDelimiter,
      hasPolygonFromAnnotator,
      active
    ],
  });
};
