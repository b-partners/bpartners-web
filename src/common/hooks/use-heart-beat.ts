import { authProvider, securityApi } from '@/providers';
import { useQuery } from '@tanstack/react-query';
import { Redirect } from '../utils';

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
    queryKey: ['heart-beat'],
    refetchInterval: 30000,
    staleTime: 30000,
  });
};
