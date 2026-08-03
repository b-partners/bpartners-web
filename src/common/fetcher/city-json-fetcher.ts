import { saveThreeDGenerationSnapshot } from '@/operations/annotator/utils';
import { annotatorProvider, cache, getCached, polygonMapper } from '@/providers';
import { getCityJSON, getExistingCityJSON } from '@/providers/city-json-provider';
import { Polygon } from '@bpartners/annotator-component';
import { AreaPictureDetails } from '@bpartners/typescript-client';
import { useQuery } from '@tanstack/react-query';
import { v4 as uuid } from 'uuid';
import { annotatorStore, getAnnotationScreen, useAnnotator3DStore, useAnnotatorScreenSwitch } from '../store';
import { copyObject, getFileUrl, getImageFromCache, getImageSize } from '../utils';

export const CITY_JSON_QUERY_KEY_PREFIX = 'city-json-process';
export const CITY_JSON_QUERY_KEY = (hash: string) => [CITY_JSON_QUERY_KEY_PREFIX, hash];

const VERTICES_TEXTURE_OFFSET_PER_SHIFT = 1024;

export const shiftVerticesTextures = (verticesTextures: [number, number][] = [], areaPicture: AreaPictureDetails, imageSize: number): [number, number][] => {
  const shift = areaPicture?.shiftNb || 0;
  if (!shift) return verticesTextures;

  const offset = (shift * VERTICES_TEXTURE_OFFSET_PER_SHIFT) / imageSize;

  const xOffset = areaPicture.shiftDirection === 'RIGHT_LEFT_SIDE' ? offset : 0;
  const yOffset = areaPicture.shiftDirection === 'UP_DOWN_SIDE' ? offset : 0;

  return verticesTextures.map(([u, v]) => [u - xOffset, v + yOffset]);
};

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
  const { setCityJsonModel, regenerateVersion } = useAnnotator3DStore();
  const { threeDMode } = useAnnotatorScreenSwitch();
  return useQuery({
    enabled: active && hasPolygonFromAnnotator,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    queryFn: async ({ signal }) => {
      const existingId = annotatorStore.useAnnotatorStore.getState().threeDGenerationId;
      const imageUri = getFileUrl(areaPicture.fileId, 'AREA_PICTURE');
      const cachedImageBlob = await getImageFromCache(areaPicture.fileId);
      const imageUrl = cachedImageBlob ? URL.createObjectURL(cachedImageBlob) : imageUri;

      let data;

      if (existingId) {
        data = await getExistingCityJSON(existingId, signal);
      } else {
        const cachedCityJSONRequestId = getCached.cityJSONRequestId();
        const cityJSONRequestId = cachedCityJSONRequestId || uuid();

        cache.cityJSONRequestId(cityJSONRequestId);
        const _imageSize = await getImageSize(imageUrl);
        let imageSize = +_imageSize.toString();
        // do not remove
        // fix for pixel to long lat
        // polygon size on 20 extended image
        if (areaPicture.actualLayer.name === 'FLUX_IGN_2023_20CM' && areaPicture.isExtended) {
          imageSize = imageSize / 3;
        }
        let mappedCoordinates = [];
        const annotations = annotatorStore.useAnnotatorStore.getState().annotations;
        const annotationValues = Object.values(annotations).filter(annotation => getAnnotationScreen(annotation) === 'annotator');

        if (threeDMode === 'roof') {
          const roofPolygon = annotationValues.find(annotation => annotation.annotationInfos.labelType === 'roof')?.polygon || polygonFromAnnotator;
          mappedCoordinates = [await mapPixelPolygonToLatLonPolygon(roofPolygon, areaPicture, imageSize)];
        } else {
          const pans = annotationValues
            .filter(annotation => annotation.annotationInfos.labelType === 'pan')
            .map(annotation => mapPixelPolygonToLatLonPolygon(annotation.polygon, areaPicture, imageSize));

          mappedCoordinates = (await Promise.all(pans)).map(a => [a]) as any;
        }

        const tileOffset = areaPicture.isExtended ? 1 : 0;

        data = await getCityJSON(
          {
            id: cityJSONRequestId,
            roofDelimiter: mappedCoordinates,
            usePan: threeDMode === 'pan',
            imageUrl: imageUri,
            imageHeight: _imageSize,
            imageWidth: _imageSize,
            tileX: areaPicture.xTile - tileOffset,
            tileY: areaPicture.yTile - tileOffset,
            zoom: areaPicture.zoom.number,
            tileImageSizePx: imageSize > 2048 ? 1024 : imageSize,
          },
          () => annotatorStore.useAnnotatorStore.getState().setThreeDGenerationId(cityJSONRequestId),
          signal
        );

        saveThreeDGenerationSnapshot(areaPicture.fileId, threeDMode === 'pan' ? 'pan' : 'roof');
      }

      const imageBlob = cachedImageBlob || (await fetch(imageUri).then(response => response.blob()));
      const imageAsBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(imageBlob);
      });
      const result = copyObject(data);

      if (result && result.transform) setCityJsonModel(result);

      const textureImage = imageAsBase64;
      const imageSize = await getImageSize(imageAsBase64);
      result.appearance.textures[0].image = textureImage;
      result.appearance['vertices-texture'] = shiftVerticesTextures(result.appearance['vertices-texture'], areaPicture, imageSize);

      return result;
    },
    queryKey: CITY_JSON_QUERY_KEY(JSON.stringify({ areaPicture, polygonFromAnnotator, regenerateVersion })),
  });
};
