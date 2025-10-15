import { annotatorProvider, polygonMapper } from '@/providers';
import { Polygon } from '@bpartners/annotator-component';
import { AreaPictureDetails } from '@bpartners/typescript-client';
import { useQuery } from '@tanstack/react-query';
import getAreaOfPolygon from 'geolib/es/getAreaOfPolygon';

interface Params {
  polygon: Polygon;
  areaPictureDetails: AreaPictureDetails;
  onSuccess?: (area: number) => void;
}

export const usePolygonAreaQuery = (params: Params) => {
  const queryFn = async () => {
    const imageSize = 1024;
    const geoJson = polygonMapper.toRefererGeoJson(params.polygon, imageSize, params.areaPictureDetails);
    const refererGeoJson: any = (await annotatorProvider.pointsToGeoPoints(geoJson as any)) || {};

    const regions = (Object.values(refererGeoJson)[0] as any)?.regions;
    const { all_points_x, all_points_y } = (Object.values(regions)[0] as any)?.shape_attributes || {};

    const coordinates: { longitude: number; latitude: number }[] = [];

    (all_points_x as any[])?.forEach((latitude, index) => {
      coordinates.push({ latitude, longitude: all_points_y[index] });
    });

    const area = +getAreaOfPolygon(coordinates).toFixed(2);
    params?.onSuccess(area);

    return area;
  };

  return useQuery({ queryFn, queryKey: ['polygonArea', params.polygon.id] });
};
