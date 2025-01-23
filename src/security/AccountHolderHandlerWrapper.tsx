import { BPLoader } from '@/common/components';
import { accountHolderProvider, authProvider } from '@/providers';
import { useQuery } from '@tanstack/react-query';
import { FC, PropsWithChildren } from 'react';

export const AccountHolderHandlerWrapper: FC<PropsWithChildren> = ({ children }) => {
  const isSubscribed = authProvider.isSubscribed();
  const { data: accountHolder = null, isLoading } = useQuery({
    retry: 7,
    queryKey: ['accountHolder'],
    queryFn: () => (isSubscribed ? accountHolderProvider.getOne() : null),
  });

  return (isLoading ?? !accountHolder) ? <BPLoader message='Chargement des données de votre compte...' /> : children;
};
