import { getSubscriptionPlans } from '@/providers';
import { SubscriptionPlan } from '@bpartners/typescript-client';
import { useQuery } from '@tanstack/react-query';

const toDisplayablePlans = (plans: SubscriptionPlan[]) =>
  plans.filter(({ isDeprecated }) => !isDeprecated).sort((a, b) => (a.displayPosition ?? Infinity) - (b.displayPosition ?? Infinity));

export const useGetSubscriptionPlans = () => {
  const { data = [], isLoading, isError } = useQuery({ queryKey: ['SubscriptionPlansQuery'], queryFn: getSubscriptionPlans, select: toDisplayablePlans });
  return {
    plans: data,
    isPlansLoading: isLoading,
    isPlansError: isError,
  };
};
