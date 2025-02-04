import { BPLoader } from '@/common/components';
import { accountHolderProvider, authProvider } from '@/providers';
import { useQuery } from '@tanstack/react-query';
import { AxiosError, isAxiosError } from 'axios';
import { FC, PropsWithChildren } from 'react';

const isAuthError = (error: AxiosError) => error?.status === 401 || error?.status === 403;
export const AccountHolderHandlerWrapper: FC<PropsWithChildren> = ({ children }) => {
  const isSubscribed = authProvider.isSubscribed();
  const { isLoading } = useQuery({
    retry: 5,
    queryKey: ['accountHolder'],
    queryFn: async () => {
      try {
        return isSubscribed ? await accountHolderProvider.getOne() : null;
      } catch (error) {
        if (isAxiosError(error) && isAuthError(error)) {
          return null;
        }
        throw error;
      }
    },
  });

  return isLoading ? <BPLoader message='Chargement des données de votre compte...' /> : children;
};
