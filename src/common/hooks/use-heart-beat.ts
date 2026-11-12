import { authProvider, getBackWhoami } from '@/providers';
import { useQuery } from '@tanstack/react-query';
import { useRef } from 'react';
import { Redirect, printError } from '../utils';

const HEART_BEAT_INTERVAL_MS = 30000;
const EXPIRED_SESSION_STATUSES = [401, 403];

const isExpiredSession = (error: any) => EXPIRED_SESSION_STATUSES.includes(error?.status ?? error?.response?.status);

export const useHeartBeat = () => {
  const isLoggingOut = useRef(false);

  const logoutExpiredSession = async () => {
    if (isLoggingOut.current) return;
    isLoggingOut.current = true;
    await authProvider.logout().catch(printError);
    Redirect.toURL('/login');
  };

  useQuery({
    queryKey: ['heart-beat-whoami'],
    queryFn: async () => {
      try {
        const whoami = await getBackWhoami();
        if (!whoami) await logoutExpiredSession();
        return whoami ?? null;
      } catch (error) {
        if (isExpiredSession(error)) await logoutExpiredSession();
        else printError(error);
        return null;
      }
    },
    refetchInterval: HEART_BEAT_INTERVAL_MS,
    staleTime: HEART_BEAT_INTERVAL_MS,
    retry: false,
  });
};
