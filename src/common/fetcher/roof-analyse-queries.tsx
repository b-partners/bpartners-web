import { createImage, fetchImageAsBase64, getCroppedImageAndPolygons } from '@/operations/annotator/utils';
import { annotatorProvider, DetectionResultInVgg, detectionResultMapper, initializeRoofAnalyse, polygonMapper, Region } from '@/providers';
import { AreaPictureDetails } from '@bpartners/typescript-client';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useLocation, useSearchParams } from 'react-router-dom';
import { ErrorMessageDialog } from '../components';
import { useAnnotatorComponentStore } from '../store';
import { useDialog } from '../store/dialog';
import { useQuerySlopeAndHeight } from './slope-and-height-queries';

export const useInitRoofAnalyseQuery = (address: string, areaPictureDetails: AreaPictureDetails) => {
  const mutationFn = async () => await initializeRoofAnalyse(areaPictureDetails.actualLayer?.name ?? '', address);
  return useMutation({ mutationFn, mutationKey: [address, areaPictureDetails] });
};

export const useRoofAnalyseQuery = (polygons: any[], areaPictureDetails: AreaPictureDetails, handleSuccess: () => void) => {
  const { open: openDialog } = useDialog();
  const { start: querySlopeAndHeight } = useQuerySlopeAndHeight(() => {}, false);
  const { setAnalyseInformation } = useAnnotatorComponentStore();

  const onSuccess = (detectionResult: any) => {
    const geoJsonResultUrl = detectionResult?.result?.geoJsonZone?.[0]?.properties?.vgg_file_url;
    const imageUrl = detectionResult?.result?.geoJsonZone?.[0]?.properties?.original_image_url;
    handleSuccess();
    setAnalyseInformation({ geoJsonResultUrl, imageUrl });
  };

  const mutationFn = async () => {
    const imageSize = 1024;
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

    querySlopeAndHeight();
    return await initializeRoofAnalyse(areaPictureDetails.actualLayer?.name ?? '', `${areaPictureDetails.address}`, [mappedCoordinates], true);
  };

  const mutation = useMutation({
    mutationFn,
    onError: (e: any) => {
      let errorMessage = 'La détection sur cette zone a échoué, veuillez réessayer';
      if (e.message === 'polygonTooBig') errorMessage = 'La délimitation que vous avez faite est trop grande et ne peut pas encore être prise en charge.';
      openDialog(<ErrorMessageDialog message={errorMessage} />);
    },
    onSuccess,
  });

  return mutation;
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

export const useGeojsonQueryResult = (keys: any[] = [], enabledParams = true) => {
  const { geoJsonResultUrl, imageUrl } = useAnnotatorComponentStore();
  const [searchParams] = useSearchParams();
  const { pathname } = useLocation();

  const enabled = !!geoJsonResultUrl && enabledParams && searchParams.get('useDraft') !== 'true' && pathname === '/annotator';

  const queryFnVgg = async () => {
    const detectionResultText = await fetch(geoJsonResultUrl, { headers: { 'content-type': 'application/json' } });
    const _detectionResultJson: DetectionResultInVgg = await detectionResultText.json();
    const detectionResultJson: DetectionResultInVgg = Array.isArray(_detectionResultJson) ? _detectionResultJson[0] : _detectionResultJson;
    const regions = getRegions(detectionResultJson);
    const filteredPolygons = detectionResultMapper.toPolygon(regions.slice());
    const nonFilteredPolygons = detectionResultMapper.toPolygon(regions.slice(), false);

    const obstacle = isThereAnObstacle(regions.slice());

    const imageAsBase64 = await fetchImageAsBase64(imageUrl);
    const image = await createImage(imageAsBase64);

    const { image: croppedImage, polygons: croppedPolygons } = getCroppedImageAndPolygons(filteredPolygons, nonFilteredPolygons, image as HTMLImageElement);
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
