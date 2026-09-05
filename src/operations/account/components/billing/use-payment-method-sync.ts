import { PAYMENT_METHOD_QUERY_KEY } from '@/operations/account/queries';
import { CREDIT_PURCHASE_STATUS_PARAM, getDefaultPaymentMethod } from '@/providers';
import { UserSubscriptionPaymentMethod } from '@bpartners/typescript-client';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

export const PAYMENT_METHOD_SYNC_INTERVAL_MS = 3000;

export const MAX_PAYMENT_METHOD_SYNC_ATTEMPTS = 15;

export type PaymentMethodSyncStatus = 'IDLE' | 'PENDING' | 'SYNCED' | 'TIMEOUT';

export interface PaymentMethodSync {
  status: PaymentMethodSyncStatus;
  attempt: number;
  maxAttempts: number;
  progress: number;
}

const hasRegisteredCard = (paymentMethod?: UserSubscriptionPaymentMethod | null) => !!paymentMethod?.card?.lastFourDigits;

export const usePaymentMethodSync = (): PaymentMethodSync => {
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<PaymentMethodSyncStatus>('IDLE');
  const [attempt, setAttempt] = useState(0);
  const [isTriggered, setTriggered] = useState(false);
  const isPurchaseSucceeded = searchParams.get(CREDIT_PURCHASE_STATUS_PARAM) === 'done';

  useEffect(() => {
    if (isPurchaseSucceeded) setTriggered(true);
  }, [isPurchaseSucceeded]);

  useEffect(() => {
    if (!isTriggered) return;
    if (hasRegisteredCard(queryClient.getQueryData<UserSubscriptionPaymentMethod | null>(PAYMENT_METHOD_QUERY_KEY))) return;
    let cancelled = false;
    let attempts = 0;
    let timer: ReturnType<typeof setTimeout>;
    setStatus('PENDING');
    const poll = async () => {
      attempts += 1;
      setAttempt(attempts);
      const paymentMethod = await queryClient
        .fetchQuery({ queryKey: PAYMENT_METHOD_QUERY_KEY, queryFn: getDefaultPaymentMethod, staleTime: 0 })
        .catch(() => null);
      if (cancelled) return;
      if (hasRegisteredCard(paymentMethod)) {
        setStatus(attempts > 1 ? 'SYNCED' : 'IDLE');
        return;
      }
      if (attempts >= MAX_PAYMENT_METHOD_SYNC_ATTEMPTS) {
        setStatus('TIMEOUT');
        return;
      }
      timer = setTimeout(poll, PAYMENT_METHOD_SYNC_INTERVAL_MS);
    };
    poll();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [isTriggered, queryClient]);

  return {
    status,
    attempt,
    maxAttempts: MAX_PAYMENT_METHOD_SYNC_ATTEMPTS,
    progress: Math.min(100, Math.round((attempt / MAX_PAYMENT_METHOD_SYNC_ATTEMPTS) * 100)),
  };
};
