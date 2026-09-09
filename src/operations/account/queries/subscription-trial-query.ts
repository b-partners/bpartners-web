import { userSubscriptionProvider } from '@/providers';
import { SubscriptionTrialEligibility } from '@bpartners/typescript-client';
import { useQuery } from '@tanstack/react-query';

const toEligiblePlanIds = (eligibilities: SubscriptionTrialEligibility[]) =>
  new Set(eligibilities.filter(({ eligible }) => eligible).map(({ subscriptionPlanIdentifier }) => subscriptionPlanIdentifier));

export const useGetTrialEligibility = (enabled = true) => {
  const {
    data = new Set<string | undefined>(),
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['SubscriptionTrialEligibilityQuery'],
    queryFn: () => userSubscriptionProvider.getTrialEligibility(),
    select: toEligiblePlanIds,
    enabled,
  });
  return {
    eligibleTrialPlanIds: data,
    isTrialEligibilityLoading: isLoading,
    isTrialEligibilityError: isError,
  };
};
