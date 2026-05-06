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
          return authProvider.logout().then(() => Redirect.toURL(`${location.hostname}/login`));
        }
      }
    },
    queryKey: ['heart-beat'],
    refetchInterval: 30000,
    staleTime: 30000,
  });
};
