import { AnnotationInfo } from '@/operations/annotator';
import { getCenter, shiftPolygons } from '@/operations/annotator/utils';
import { analyseGeneratedIdRef, roofGlobalIdRef } from '@/operations/prospects/constants';
import { annotatorProvider, polygonMapper } from '@/providers';
import { Measurement, Polygon } from '@bpartners/annotator-component';
import { AreaPictureDetails } from '@bpartners/typescript-client';
import { useQuery } from '@tanstack/react-query';
import getAreaOfPolygon from 'geolib/es/getAreaOfPolygon';
import getDistance from 'geolib/es/getPreciseDistance';
import { useAnnotatorComponentStore } from '../store';
import { copyObject, getFileUrl, getImageFromCache, getImageSize } from '../utils';

interface Params {
  polygon: Polygon;
  annotationInfos: AnnotationInfo;
  areaPictureDetails: AreaPictureDetails;
  onSuccess?: (params: { area: number; measurements: Measurement[] }) => void;
  isAfterAnalyse?: boolean;
}

type GeoCoordinate = { longitude: number; latitude: number };

const getAnalyseCoordinates = async (polygon: Polygon, imageTileInfoOrigin: any): Promise<GeoCoordinate[]> => {
  const feature = {
    geometry: {
      coordinates: [[polygon.points.map(({ x, y }) => [x, y])]],
      type: 'MultiPolygon',
    },
    properties: { confidence: 1, label: 'polygon' },
    type: 'Feature',
  };

  const pixelGeoJson = polygonMapper.toPixelGeoJson(
    [feature],
    imageTileInfoOrigin?.coordinates?.x,
    imageTileInfoOrigin?.coordinates?.y,
    imageTileInfoOrigin?.size?.width,
    20
  );

  const lonLatGeoJson: any = (await annotatorProvider.pixelPointsToLonLat(pixelGeoJson)) || {};
  const regions = (Object.values(lonLatGeoJson)[0] as any)?.regions;
  const { all_points_x, all_points_y } = (Object.values(regions)[0] as any)?.shape_attributes || {};

  const coordinates: GeoCoordinate[] = [];
  (all_points_x as any[])?.forEach((longitude, index) => {
    coordinates.push({ longitude, latitude: all_points_y[index] });
  });

  return coordinates;
};

const getRefererCoordinates = async (polygon: Polygon, areaPictureDetails: AreaPictureDetails, imageSize: number): Promise<GeoCoordinate[]> => {
  const geoJson = polygonMapper.toRefererGeoJson({ ...polygon, points: polygon.points.map(p => ({ x: p.x, y: p.y })) }, imageSize, areaPictureDetails);
  const refererGeoJson: any = (await annotatorProvider.pointsToGeoPoints(geoJson as any)) || {};

  const regions = (Object.values(refererGeoJson)[0] as any)?.regions;
  const { all_points_x, all_points_y } = (Object.values(regions)[0] as any)?.shape_attributes || {};

  const coordinates: GeoCoordinate[] = [];
  (all_points_x as any[])?.forEach((latitude, index) => {
    coordinates.push({ latitude, longitude: all_points_y[index] });
  });

  return coordinates;
};

export const usePolygonAreaQuery = (params: Params) => {
  const imageTileInfoOrigin = useAnnotatorComponentStore(state => state.imageTileInfoOrigin);
  const useAnalyseTileConversion = !!params.isAfterAnalyse && !!imageTileInfoOrigin?.coordinates && !!imageTileInfoOrigin?.size?.width;

  const queryFn = async () => {
    let polygon: Polygon;
    let coordinates: GeoCoordinate[];

    if (useAnalyseTileConversion) {
      polygon = params.polygon;
      coordinates = await getAnalyseCoordinates(polygon, imageTileInfoOrigin);
    } else {
      const imageUri = getFileUrl(params.areaPictureDetails.fileId, 'AREA_PICTURE');
      const cachedImageBlob = await getImageFromCache(params.areaPictureDetails.fileId);
      const imageUrl = cachedImageBlob ? URL.createObjectURL(cachedImageBlob) : imageUri;

      let imageSize = await getImageSize(imageUrl);
      if (params.areaPictureDetails.actualLayer.name === 'FLUX_IGN_2023_20CM' && params.areaPictureDetails.isExtended) {
        imageSize = imageSize / 3;
      }

      const currentAreaPictureDetails = copyObject(params.areaPictureDetails);

      [polygon] = !params.isAfterAnalyse ? shiftPolygons([copyObject(params.polygon)], currentAreaPictureDetails, true) : [params.polygon];
      coordinates = await getRefererCoordinates(polygon, currentAreaPictureDetails, imageSize);
    }

    const area = +(getAreaOfPolygon(coordinates) / (params.annotationInfos.slope ? Math.cos(params.annotationInfos.slope * (Math.PI / 180)) : 1)).toFixed(2);

    const measurements: Measurement[] = [];

    if (polygon.id.includes(roofGlobalIdRef) || !polygon.id.includes(analyseGeneratedIdRef)) {
      for (let i = 1; i < polygon.points.length; i++) {
        const prev = coordinates[i - 1];
        const current = coordinates[i];
        const distance = +getDistance(prev, current, 0.2).toFixed(2);

        measurements.push({
          position: getCenter(polygon.points[i - 1], polygon.points[i]),
          unity: 'm',
          value: distance,
          polygonId: polygon.id,
          isInvisible: true,
        });
      }
    }

    params?.onSuccess({ area, measurements });
    return { area, measurements };
  };

  return useQuery({
    queryFn,
    queryKey: [params.polygon?.id, JSON.stringify(params.polygon?.points), params.annotationInfos.slope, useAnalyseTileConversion],
  });
};
