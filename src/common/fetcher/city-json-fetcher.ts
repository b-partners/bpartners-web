import { getCityJson } from '@/providers';
import { useQuery } from '@tanstack/react-query';
import { useAnnotatorComponentStore } from '../store';

export const useCityJsonFetcher = () => {
  const { roofDelimiter } = useAnnotatorComponentStore();
  return useQuery({
    enabled: !!roofDelimiter.polygon,
    queryFn: () => getCityJson(roofDelimiter.polygon),
    queryKey: ['city-json', JSON.stringify(roofDelimiter)],
  });
};
