import { BPLoader } from '@/common/components';
import { accountHolderProvider, authProvider } from '@/providers';
import { useQuery } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { FC, PropsWithChildren } from 'react';

export const AccountHolderHandlerWrapper: FC<PropsWithChildren> = ({ children }) => {
  const isSubscribed = authProvider.isSubscribed();
  const { isLoading, error, isError } = useQuery({
    retry: 7,
    queryKey: ['accountHolder'],
    queryFn: () => (isSubscribed ? accountHolderProvider.getOne() : null),
  });

  if (isError && isAxiosError(error)) {
    if (error.status === 403) {
      return children;
    }
  }

  return isLoading ? <BPLoader message='Chargement des données de votre compte...' /> : children;
};
