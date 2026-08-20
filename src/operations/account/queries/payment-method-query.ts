import { getDefaultPaymentMethod } from '@/providers';
import { useQuery } from '@tanstack/react-query';

export const PAYMENT_METHOD_QUERY_KEY = ['DefaultPaymentMethodQuery'];

export const useGetDefaultPaymentMethod = (enabled = true) => {
  const { data, isLoading, isError } = useQuery({ queryKey: PAYMENT_METHOD_QUERY_KEY, queryFn: getDefaultPaymentMethod, enabled });
  return {
    paymentMethod: data,
    isPaymentMethodLoading: isLoading,
    isPaymentMethodError: isError,
  };
};
