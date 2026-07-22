import { accountHolderProvider } from '@/providers';
import { useMutation } from '@tanstack/react-query';

export const useAccountHolderProviderFieldsCompany = () => {
  const { isPending, mutateAsync } = useMutation({
    mutationKey: ['accountHolderProviderFieldsCompany'],
    mutationFn: accountHolderProvider.saveOrUpdate,
    onError: error => console.log(error),
  });

  return {
    isaccountHolderProvider: isPending,
    accountHolderProvider: mutateAsync,
  };
};
