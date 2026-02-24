import { getCenter } from '@/operations/annotator/utils';
import { analyseGeneratedIdRef, roofGlobalIdRef } from '@/operations/prospects/constants';
import { annotatorProvider, getCached, polygonMapper } from '@/providers';
import { Measurement, Polygon } from '@bpartners/annotator-component';
import { AreaPictureDetails } from '@bpartners/typescript-client';
import { useQuery } from '@tanstack/react-query';
import getAreaOfPolygon from 'geolib/es/getAreaOfPolygon';
import getDistance from 'geolib/es/getPreciseDistance';
import { getImageSize, UrlParams } from '../utils';

interface Params {
  polygon: Polygon;
  areaPictureDetails: AreaPictureDetails;
  onSuccess?: (params: { area: number; measurements: Measurement[] }) => void;
}

export const usePolygonAreaQuery = (params: Params) => {
  const queryFn = async () => {
    const imageUrl = UrlParams.get('imgUrl');
    const imageSize = getCached.currentImageSize() || (await getImageSize(imageUrl)) || 1024;
    const geoJson = polygonMapper.toRefererGeoJson(params.polygon, imageSize, params.areaPictureDetails);
    const refererGeoJson: any = (await annotatorProvider.pointsToGeoPoints(geoJson as any)) || {};

    const regions = (Object.values(refererGeoJson)[0] as any)?.regions;
    const { all_points_x, all_points_y } = (Object.values(regions)[0] as any)?.shape_attributes || {};

    const coordinates: { longitude: number; latitude: number }[] = [];

    (all_points_x as any[])?.forEach((latitude, index) => {
      coordinates.push({ latitude, longitude: all_points_y[index] });
    });

    const area = +(getAreaOfPolygon(coordinates) / (getCached.currentImageSize() ? 4 : 1)).toFixed(2);

    const measurements: Measurement[] = [];

    if (params.polygon.id.includes(roofGlobalIdRef) || !params.polygon.id.includes(analyseGeneratedIdRef)) {
      for (let i = 1; i < params.polygon.points.length; i++) {
        const prev = coordinates[i - 1];
        const current = coordinates[i];
        const distance = +(getDistance(prev, current, 0.2) / (getCached.currentImageSize() ? 4 : 1)).toFixed(2);
        measurements.push({
          position: getCenter(params.polygon.points[i - 1], params.polygon.points[i]),
          unity: 'm',
          value: distance,
          polygonId: params.polygon.id,
          isInvisible: true,
        });
      }
    }

    params?.onSuccess({ area, measurements });
    return { area, measurements };
  };

  return useQuery({ queryFn, queryKey: ['polygonArea', params.polygon?.id, JSON.stringify(params.polygon?.points)] });
};
