import {
  annotatorProvider,
  DetectionResultInVgg,
  detectionResultMapper,
  fromBase64,
  initializeRoofAnalyse,
  polygonMapper,
  Region,
  toBase64,
} from '@/providers';
import { AreaPictureDetails, Prospect } from '@bpartners/typescript-client';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getImageSize } from '../utils';

export const useInitRoofAnalyseQuery = (address: string, areaPictureDetails: AreaPictureDetails) => {
  const mutationFn = async () => await initializeRoofAnalyse(areaPictureDetails.actualLayer?.name ?? '', address);
  return useMutation({ mutationFn, mutationKey: [address, areaPictureDetails] });
};

export const useRoofAnalyseQuery = (polygons: any[], areaPictureDetails: AreaPictureDetails, imageSrc: string, prospect: Prospect) => {
  const navigate = useNavigate();
  const onSuccess = (data: any) => {
    const vggurl = data?.result?.geoJsonZone?.[0]?.properties?.vgg_file_url;
    console.log(vggurl);

    const { href } = window.location;
    const url = new URL(href);
    url.searchParams.set('analyseRoof', 'false');
    navigate(`/annotator${url.search}&geoJsonResultUrl=${toBase64(`${vggurl}`)}`);
  };

  const mutationFn = async () => {
    const imageSize = await getImageSize(imageSrc);
    const geoJson = polygonMapper.toRefererGeoJson(polygons[0], imageSize, areaPictureDetails);
    const refererGeoJson: any = (await annotatorProvider.pointsToGeoPoints(geoJson as any)) || {};

    const regions = (Object.values(refererGeoJson)[0] as any)?.regions;
    const { all_points_x, all_points_y } = (Object.values(regions)[0] as any)?.shape_attributes || {};

    const coordinates: any[] = [];

    (all_points_x as any[])?.forEach((latitude, index) => {
      coordinates.push({ latitude, longitude: all_points_y[index] });
    });

    if (!refererGeoJson) return null;

    const mappedCoordinates: number[][] = [];

    (all_points_x as any[])?.forEach((x, index) => {
      if (index !== all_points_x.length - 1) mappedCoordinates.push([all_points_y[index], x]);
    });

    return await initializeRoofAnalyse(
      areaPictureDetails.actualLayer?.name ?? '',
      `${areaPictureDetails.address}`,
      [[mappedCoordinates]],
      prospect.email,
      true
    );
  };

  return useMutation({ mutationFn, onSuccess });
};

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

export const useGeojsonQueryResult = (keys: any[] = [], enabled = true) => {
  const [searchParams] = useSearchParams();

  const geoJsonResultUrl = fromBase64(`${searchParams.get('geoJsonResultUrl')}`);

  const queryFnVgg = async () => {
    const detectionResultText = await fetch(geoJsonResultUrl, { headers: { 'content-type': '*/*' } });
    const detectionResultJson: DetectionResultInVgg = await detectionResultText.json();

    const regions = getRegions(detectionResultJson);

    const polygons = detectionResultMapper.toPolygon(regions);
    const obstacle = isThereAnObstacle(regions);

    return { properties: { ...Object.values(detectionResultJson)[0].properties, obstacle: obstacle }, polygons };
  };

  const query = useQuery({
    queryKey: ['geojson-result', ...keys],
    queryFn: queryFnVgg,
    enabled: !!geoJsonResultUrl && enabled && searchParams.get('useDraft') !== 'true',
  });
  return {
    ...query,
    geoJsonResultUrl,
  };
};
