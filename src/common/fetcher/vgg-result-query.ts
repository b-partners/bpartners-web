import { createImage, fetchImageAsBase64, getCroppedImageAndPolygons } from '@/operations/annotator/utils';
import { roofGlobalIdRef } from '@/operations/prospects/constants';
import {
  annotatorProvider,
  DetectionResultInVgg,
  detectionResultMapper,
  DomainPolygonResultType,
  geoShapeAttributesToPoints,
  polygonMapper,
  Region,
} from '@/providers';
import { useQuery } from '@tanstack/react-query';
import { useLocation, useSearchParams } from 'react-router-dom';
import { v4 } from 'uuid';
import { useAnnotatorComponentStore } from '../store';

const getRegions = (detectionResult: DetectionResultInVgg) => {
  const detections = Object.values(detectionResult);

  const regions: Region[] = [];

  detections.forEach(({ regions: currentRegion }) => {
    const regionsValues = Object.values(currentRegion);
    regions.push(...regionsValues);
  });

  return regions;
};

const isThereAnObstacle = (regions: Region[]) => {
  for (const region of regions) {
    if (['OBSTACLE', 'VELUX', 'CHEMINEE'].includes(region.region_attributes.label)) {
      return true;
    }
  }

  return false;
};

export const useGeojsonQueryResult = (keys: any[] = [], enabledParams = true) => {
  const { geoJsonResultUrl, imageUrl, roofDelimiter, imageTileInfoOrigin } = useAnnotatorComponentStore();
  const [searchParams] = useSearchParams();
  const { pathname } = useLocation();

  const enabled = !!geoJsonResultUrl && enabledParams && searchParams.get('useDraft') !== 'true' && pathname === '/annotator';

  const queryFnVgg = async () => {
    const detectionResultText = await fetch(geoJsonResultUrl, { headers: { 'content-type': 'application/json' } });

    const roofPolygonInGeoPoint = roofDelimiter?.polygon || [];
    const feature: any = {
      geometry: {
        coordinates: [[roofPolygonInGeoPoint]],
        type: 'MultiPolygon',
      },
      properties: {
        confidence: 1,
        label: 'polygon',
      },
      type: 'Feature',
    };

    const pixelGeoJson = polygonMapper.toPixelGeoJson(
      [feature],
      imageTileInfoOrigin?.coordinates?.x,
      imageTileInfoOrigin?.coordinates?.y,
      imageTileInfoOrigin?.size?.width,
      imageTileInfoOrigin?.coordinates?.z
    );

    const pixelGeoJsonResult = await annotatorProvider.geoPointsToPoins(pixelGeoJson);

    const { regions: pixelGeoJsonResultRegion } = Object.values(pixelGeoJsonResult)?.[0] as any;
    const { shape_attributes: pixelGeoJsonResultShapeAttributes } = Object.values(pixelGeoJsonResultRegion)?.[0] as any;
    const roofPolygonPoints = geoShapeAttributesToPoints(pixelGeoJsonResultShapeAttributes);

    const roofPolygon: DomainPolygonResultType = {
      id: `${v4()}__${roofGlobalIdRef}`,
      label: 'TOIT',
      points: roofPolygonPoints,
      fillColor: '#00ff0000',
      strokeColor: '#00ff00',
    };

    const _detectionResultJson: DetectionResultInVgg = await detectionResultText.json();
    const detectionResultJson: DetectionResultInVgg = Array.isArray(_detectionResultJson) ? _detectionResultJson[0] : _detectionResultJson;
    const regions = getRegions(detectionResultJson);
    const filteredPolygons = detectionResultMapper.toPolygon(regions.slice());

    // sort polygons in the expected order
    const usurePolygons = filteredPolygons.filter(({ id: polygonId }) => polygonId.includes('USURE')) || [];
    const moisissurePolygons = filteredPolygons.filter(({ id: polygonId }) => polygonId.includes('MOISISSURE')) || [];
    const humiditePolygons = filteredPolygons.filter(({ id: polygonId }) => polygonId.includes('HUMIDITE')) || [];
    const othersPolygons =
      filteredPolygons.filter(({ id: polygonId }) => !polygonId.includes('HUMIDITE') && !polygonId.includes('MOISISSURE') && !polygonId.includes('USURE')) ||
      [];
    // sort polygons in the expected order
    const obstacle = isThereAnObstacle(regions.slice());

    const imageAsBase64 = await fetchImageAsBase64(imageUrl);
    const image = await createImage(imageAsBase64);

    const { image: croppedImage, polygons: croppedPolygons } = getCroppedImageAndPolygons(
      [roofPolygon, ...usurePolygons, ...moisissurePolygons, ...humiditePolygons, ...othersPolygons],
      [roofPolygon],
      image as HTMLImageElement
    );

    return {
      properties: { ...Object.values(detectionResultJson)[0].properties, obstacle: obstacle },
      polygons: croppedPolygons,
      image: regions.length > 0 ? croppedImage : imageAsBase64,
    };
  };

  const query = useQuery({
    queryKey: ['geojson-result', ...keys],
    queryFn: queryFnVgg,
    enabled,
  });

  return {
    ...query,
    geoJsonResultUrl,
  };
};
