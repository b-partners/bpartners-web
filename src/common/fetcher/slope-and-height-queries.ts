import { DetectionResultInVgg, getCached, getDetectionResult, initiateRoofProperties, SlopeAndHeightStatus } from '@/providers';
import { useQuery } from '@tanstack/react-query';
import { useToggle } from '../hooks';
import { useAnnotatorComponentStore } from '../store';

export interface SlopeAndHeightState {
  slope: number;
  height: number;
  slopeStatus: SlopeAndHeightStatus;
  heightStatus: SlopeAndHeightStatus;
}

export const useQuerySlopeAndHeight = (onSuccess: (data: SlopeAndHeightState) => void, enabled = false) => {
  const { handleClose, value: shouldRetry, handleOpen: start } = useToggle(enabled);
  const { setSlopeAndHeightState, setShouldGetHeightState, shouldGetHeightState, setIsSlopeAndHeightPending, isSlopeAndHeightPending } =
    useAnnotatorComponentStore();

  const { data, isLoading } = useQuery({
    queryKey: ['detection', 'result'],
    queryFn: async () => {
      !isSlopeAndHeightPending && setIsSlopeAndHeightPending(true);
      const isRoofPropertiesRequestDone = getCached.isRoofPropertiesRequestDone();

      if (!isRoofPropertiesRequestDone) await initiateRoofProperties();

      const detection = await getDetectionResult();

      const vgg_file_url = detection?.geoJsonZone?.[0]?.properties?.vgg_file_url || {};
      const detectionResultText = await fetch(vgg_file_url, { headers: { 'content-type': '*/*' } });

      const _detectionResultJson: any = await detectionResultText.json();
      const detectionResultJson: DetectionResultInVgg = Array.isArray(_detectionResultJson) ? _detectionResultJson[0] : _detectionResultJson;

      const { roof_height_data_status, roof_slope_in_degrees, roof_height_in_meters, roof_slope_data_status } =
        Object.values(detectionResultJson)?.[0]?.properties || {};

      if (!roof_height_data_status || !roof_slope_data_status) throw new Error('Get slope not done');
      const result = {
        slope: roof_slope_in_degrees,
        height: roof_height_in_meters,
        slopeStatus: roof_slope_data_status,
        heightStatus: roof_height_data_status,
      };

      setSlopeAndHeightState(result);
      onSuccess(result);
      setShouldGetHeightState(false);
      setIsSlopeAndHeightPending(false);
      handleClose();
      return result;
    },
    retryDelay: 5000,
    retry: Number.MAX_SAFE_INTEGER,
    enabled: shouldRetry && shouldGetHeightState,
  });

  return { data, isPending: isLoading, start };
};
