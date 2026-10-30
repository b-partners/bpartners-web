import { getSubscriptionPlans } from '@/providers';
import { SubscriptionPlan } from '@bpartners/typescript-client';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

const toDisplayablePlans = (plans: SubscriptionPlan[]) =>
  plans.filter(({ isDeprecated }) => !isDeprecated).sort((a, b) => (a.displayPosition ?? Infinity) - (b.displayPosition ?? Infinity));

export const useGetSubscriptionPlans = (enabled = true) => {
  const { data: allPlans = [], isLoading, isError } = useQuery({ queryKey: ['SubscriptionPlansQuery'], queryFn: getSubscriptionPlans, enabled });
  const plans = useMemo(() => toDisplayablePlans(allPlans), [allPlans]);
  return {
    plans,
    allPlans,
    isPlansLoading: isLoading,
    isPlansError: isError,
  };
};
