import { userSubscriptionProvider } from '@/providers';
import { useQuery } from '@tanstack/react-query';

export const SUBSCRIPTION_UPGRADE_QUERY_KEY = ['SubscriptionUpgradeInProgressQuery'];

export const useGetInProgressSubscriptionUpgrade = (enabled = true) => {
  const { data, isLoading } = useQuery({
    queryKey: SUBSCRIPTION_UPGRADE_QUERY_KEY,
    queryFn: () => userSubscriptionProvider.getInProgressUpgrade().then(upgrade => upgrade ?? null),
    enabled,
  });
  return {
    inProgressUpgrade: data ?? undefined,
    isInProgressUpgradeLoading: enabled && isLoading,
  };
};
