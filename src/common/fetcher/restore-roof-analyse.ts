import { cache, getDetectionResult } from '@/providers';
import { useQuery } from '@tanstack/react-query';
import { useAnnotatorComponentStore } from '../store';

export const useRestoreRoofAnalyse = (roofAnalyseId?: string, enabled = false) => {
  const { setAnalyseInformation, setRoofDelimiter, setImageTileInfoOrigin, geoJsonResultUrl } = useAnnotatorComponentStore();

  return useQuery({
    queryKey: ['restore-roof-analyse', roofAnalyseId],
    queryFn: async () => {
      cache.roofAnalyseId(roofAnalyseId as string);
      const detection = await getDetectionResult();
      const vggFileUrl = detection?.geoJsonZone?.[0]?.properties?.vgg_file_url;
      const originalImageUrl = detection?.geoJsonZone?.[0]?.properties?.original_image_url;
      setAnalyseInformation({ geoJsonResultUrl: vggFileUrl, imageUrl: originalImageUrl });
      if (detection?.roofDelimiter) setRoofDelimiter(detection.roofDelimiter);
      if (detection?.imageTileInfoOrigin) setImageTileInfoOrigin?.(detection.imageTileInfoOrigin);
      return detection;
    },
    enabled: enabled && !!roofAnalyseId && !geoJsonResultUrl,
    retry: false,
    refetchOnWindowFocus: false,
  });
};
