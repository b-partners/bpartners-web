import { authProvider, securityApi } from '@/providers';
import { useQuery } from '@tanstack/react-query';
import { Redirect } from '../utils';

const threeDBaseUrl = (process.env.REACT_APP_GEO_DETECTION_API ?? '').replace(/\/$/g, '');

export const useHeartBeat = () => {
  useQuery({
    queryFn: async () => {
      try {
        await securityApi().whoami();
      } catch (error: any) {
        if ([403, 401].includes(error.status)) {
          authProvider.logout().then(() => Redirect.toURL(`${location.hostname}/login`));
        }
      } finally {
        return '';
      }
    },
    queryKey: ['heart-beat-whoami'],
    refetchInterval: 30000,
    staleTime: 30000,
  });
  useQuery({
    queryFn: async () => {
      await fetch(`${threeDBaseUrl}/ping`, { method: 'GET' });
    },
    queryKey: ['heart-beat-3d'],
    refetchInterval: 60000,
    staleTime: 60000,
  });
};
