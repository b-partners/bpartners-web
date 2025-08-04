import { revenueTargetsProvider } from '@/providers';
import { useMutation } from '@tanstack/react-query';

export const useRevenueTargetsProvider = () => {
  const { isPending, mutate } = useMutation({ mutationKey: ['RevenueTargetsMutation'], mutationFn: revenueTargetsProvider.update });

  return {
    isRevenueTargetsProvider: isPending,
    updateRevenueTargets: mutate,
  };
};
