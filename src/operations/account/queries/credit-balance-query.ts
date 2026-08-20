import { getCreditBalance } from '@/providers';
import { useQuery } from '@tanstack/react-query';

export const CREDIT_BALANCE_QUERY_KEY = ['CreditBalanceQuery'];

export const useGetCreditBalance = (enabled = true) => {
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: CREDIT_BALANCE_QUERY_KEY, queryFn: getCreditBalance, enabled });
  return {
    balance: data,
    isBalanceLoading: isLoading,
    isBalanceError: isError,
    refetchBalance: refetch,
  };
};
