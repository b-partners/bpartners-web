import { getCenter } from '@/operations/annotator/utils';
import { annotatorProvider, getCached, polygonMapper } from '@/providers';
import { Polygon } from '@bpartners/annotator-component';
import { AreaPictureDetails } from '@bpartners/typescript-client';
import getDistance from 'geolib/es/getPreciseDistance';
import { copyObject, getImageSize } from '../utils';

interface Params {
  polygon: Polygon;
  areaPictureDetails: AreaPictureDetails;
  imageUrl: string;
}

export const calculatePolygonMeasurement = async (params: Params) => {
  const imageSize = getCached.currentImageSize() || (await getImageSize(params.imageUrl)) || 1024;
  const polygon = copyObject(params.polygon);

  const polygonResult = copyObject(polygon);
  polygonResult.measurements = [];

  const geoJson = polygonMapper.toRefererGeoJson(polygon, imageSize, params.areaPictureDetails);
  const refererGeoJson: any = (await annotatorProvider.pointsToGeoPoints(geoJson as any)) || {};
  const regions = (Object.values(refererGeoJson)[0] as any)?.regions;
  const { all_points_x, all_points_y } = (Object.values(regions)[0] as any)?.shape_attributes || {};

  const coordinates: { longitude: number; latitude: number }[] = [];

  (all_points_x as any[])?.forEach((latitude, index) => {
    coordinates.push({ latitude, longitude: all_points_y[index] });
  });

  for (let i = 1; i < coordinates.length; i++) {
    const prev = coordinates[i - 1];
    const current = coordinates[i];
    const distance = +getDistance(prev, current, 0.2).toFixed(2);
    polygonResult.measurements.push({
      position: getCenter(polygon.points[i - 1], polygon.points[i]),
      unity: 'm',
      value: distance,
      polygonId: polygon.id,
      isInvisible: false,
    });
  }
  return polygonResult.measurements;
};
