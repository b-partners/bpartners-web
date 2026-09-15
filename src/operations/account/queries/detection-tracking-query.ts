import { getDetectionTrackingList } from '@/providers';
import { useQuery } from '@tanstack/react-query';

export const useGetDetectionTracking = (pageSize: number) => {
  const {
    data = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['DetectionTrackingQuery', pageSize],
    queryFn: () => getDetectionTrackingList(pageSize),
  });
  return {
    detections: data,
    isDetectionsLoading: isLoading,
    isDetectionsError: isError,
  };
};
