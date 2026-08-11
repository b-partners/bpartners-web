import { getAnalyseImageFileId } from '@/constants';
import { createImage, cropImage, fetchImageAsBase64, getCropRegion } from '@/operations/annotator/utils';
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
import { UrlParams } from '@bpartners/annotator-component';
import { FileType } from '@bpartners/typescript-client';
import { useQuery } from '@tanstack/react-query';
import { useUpdate } from 'react-admin';
import { useLocation, useSearchParams } from 'react-router-dom';
import { v4 } from 'uuid';
import { useAnnotatorComponentStore } from '../store';
import { base64ToFile, saveImageToCache } from '../utils';
import { saveCropRegionDraft } from './save-annotations';

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
  const {
    geoJsonResultUrl,
    imageUrl,
    roofDelimiter,
    imageTileInfoOrigin,
    areaPictureDetails,
    slopeAndHeightState,
    llm,
    setAnalyseImageUrl,
    setAnalyseImageFileId,
    setCropRegion,
  } = useAnnotatorComponentStore();
  const [searchParams] = useSearchParams();
  const { pathname } = useLocation();
  const [uploadFile] = useUpdate('files');
  const [saveDraft] = useUpdate('drafts-annotations');

  const isAnnotatorRoute = pathname === '/annotator' || pathname.startsWith('/projects/');
  const enabled = !!geoJsonResultUrl && enabledParams && searchParams.get('useDraft') !== 'true' && isAnnotatorRoute;

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

    const resolveRoofPolygonPoints = async () => {
      if (!roofPolygonInGeoPoint.length) return [];
      try {
        const pixelGeoJson = polygonMapper.toPixelGeoJson(
          [feature],
          imageTileInfoOrigin?.coordinates?.x,
          imageTileInfoOrigin?.coordinates?.y,
          imageTileInfoOrigin?.size?.width,
          20
        );
        const pixelGeoJsonResult = await annotatorProvider.geoPointsToPoins(pixelGeoJson);
        const { regions: pixelGeoJsonResultRegion } = (Object.values(pixelGeoJsonResult || {})?.[0] as any) || {};
        const { shape_attributes: pixelGeoJsonResultShapeAttributes } = (Object.values(pixelGeoJsonResultRegion || {})?.[0] as any) || {};
        return pixelGeoJsonResultShapeAttributes ? geoShapeAttributesToPoints(pixelGeoJsonResultShapeAttributes) : [];
      } catch {
        return [];
      }
    };

    const roofPolygonPoints = await resolveRoofPolygonPoints();

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

    const allPolygons = [roofPolygon, ...usurePolygons, ...moisissurePolygons, ...humiditePolygons, ...othersPolygons];

    const shouldCrop = regions.length > 0 && roofPolygon.points.length > 0;
    const cropRegion = shouldCrop ? getCropRegion([roofPolygon], (image as HTMLImageElement).width, (image as HTMLImageElement).height) : null;
    const croppedImage = shouldCrop && cropRegion ? cropImage(image as HTMLImageElement, cropRegion) : imageAsBase64;
    setCropRegion(cropRegion);

    const fileId = areaPictureDetails?.fileId || UrlParams.get('fileId');
    const base64Image = shouldCrop ? croppedImage : imageAsBase64;

    if (fileId && base64Image && base64Image.length > 0) {
      const analyseImageFileId = getAnalyseImageFileId(fileId);
      const fileType = FileType.AREA_PICTURE;
      const fileMimeType = 'image/png';
      const analyseImageFile = base64ToFile(base64Image, `${analyseImageFileId}.png`);
      await new Promise(resolve =>
        uploadFile(
          'files',
          {
            data: { id: analyseImageFileId, fileAsArrayBuffer: analyseImageFile, fileId: analyseImageFileId, fileType, fileMimeType },
            id: analyseImageFileId,
          },
          { onSettled: () => resolve(undefined) }
        )
      );
      await saveImageToCache(analyseImageFileId, analyseImageFile);
      setAnalyseImageUrl(URL.createObjectURL(analyseImageFile));
      setAnalyseImageFileId(analyseImageFileId);
    }

    const pictureId = areaPictureDetails?.id;
    if (pictureId) saveCropRegionDraft(pictureId, saveDraft, slopeAndHeightState?.height, llm);

    return {
      properties: { ...Object.values(detectionResultJson)[0].properties, obstacle: obstacle },
      polygons: allPolygons,
      image: base64Image,
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
