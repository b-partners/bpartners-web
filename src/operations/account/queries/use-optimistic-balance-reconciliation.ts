import { useOptimisticCreditBalanceStore } from '@/common/store';
import { CreditBalance } from '@bpartners/typescript-client';
import { useEffect } from 'react';

const RECONCILE_INTERVAL_MS = 5000;

const MAX_RECONCILE_ATTEMPTS = 36;

export const useOptimisticBalanceReconciliation = (refetchBalance: () => Promise<{ data?: CreditBalance }>) => {
  const optimisticBalance = useOptimisticCreditBalanceStore(state => state.balance);
  const clearOptimisticBalance = useOptimisticCreditBalanceStore(state => state.clear);

  useEffect(() => {
    const expected = optimisticBalance;
    if (!expected) return;
    let cancelled = false;
    let attempts = 0;
    let timer: ReturnType<typeof setTimeout>;
    const reconcile = async () => {
      attempts += 1;
      const { data } = await refetchBalance();
      if (cancelled) return;
      if (data?.spendableCredits === expected.spendableCredits) {
        clearOptimisticBalance();
        return;
      }
      if (attempts >= MAX_RECONCILE_ATTEMPTS) return;
      timer = setTimeout(reconcile, RECONCILE_INTERVAL_MS);
    };
    reconcile();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [optimisticBalance, refetchBalance, clearOptimisticBalance]);
};
