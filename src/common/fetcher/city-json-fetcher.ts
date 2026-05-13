import { annotatorProvider, cache, getCached, polygonMapper } from '@/providers';
import { getCityJSON } from '@/providers/city-json-provider';
import { Polygon } from '@bpartners/annotator-component';
import { AreaPictureDetails } from '@bpartners/typescript-client';
import { useQuery } from '@tanstack/react-query';
import { v4 as uuid } from 'uuid';
import { annotatorStore, useAnnotator3DStore, useAnnotatorScreenSwitch } from '../store';
import { getFileUrl, getImageSize, UrlParams } from '../utils';

const mapPixelPolygonToLatLonPolygon = async (polygon: Polygon, areaPicture: AreaPictureDetails, imageSize: number) => {
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
  const hasPolygonFromAnnotator = !!polygonFromAnnotator;
  const { setCityJsonModel } = useAnnotator3DStore();
  const { threeDMode } = useAnnotatorScreenSwitch();
  const annotations = annotatorStore.useAnnotatorStore.getState().annotations;
  return useQuery({
    enabled: active && hasPolygonFromAnnotator,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const cachedCityJSONRequestId = getCached.cityJSONRequestId();
      const cityJSONRequestId = cachedCityJSONRequestId || uuid();

      cache.cityJSONRequestId(cityJSONRequestId);
      const imageUrl = UrlParams.get('imgUrl');
      let imageSize = await getImageSize(imageUrl);
      // do not remove
      // fix for pixel to long lat
      // polygon size on 20 extended image
      if (areaPicture.actualLayer.name === 'FLUX_IGN_2023_20CM' && areaPicture.isExtended) {
        imageSize = imageSize / 3;
      }
      let mappedCoordinates = [];

      if (threeDMode === 'roof') {
        mappedCoordinates = [
          (getCached.roofDelimiterLongLatItem() as [number, number][]) || (await mapPixelPolygonToLatLonPolygon(polygonFromAnnotator, areaPicture, imageSize)),
        ];
      } else {
        const pans = Object.values(annotations)
          .filter(annotation => annotation.annotationInfos.labelType === 'pan')
          .map(annotation => mapPixelPolygonToLatLonPolygon(annotation.polygon, areaPicture, imageSize));

        mappedCoordinates = (await Promise.all(pans)).map(a => [a]) as any;
      }

      const data = await getCityJSON({
        id: cityJSONRequestId,
        roofDelimiter: mappedCoordinates,
        usePan: threeDMode === 'pan',
        imageUrl: getFileUrl(areaPicture.fileId, 'AREA_PICTURE'),
        imageHeight: imageSize,
        imageWidth: imageSize,
        tileX: areaPicture.xTile,
        tileY: areaPicture.yTile,
        zoom: areaPicture.zoom.number,
        tileImageSizePx: imageSize > 2048 ? 1024 : imageSize,
      });
      if (data && data.transform) setCityJsonModel(data);
      return data;
    },
    queryKey: [JSON.stringify({ areaPicture, polygonFromAnnotator, annotations })],
  });
};
