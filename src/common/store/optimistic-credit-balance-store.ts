import { CreditBalance } from '@bpartners/typescript-client';
import { create } from 'zustand';

interface OptimisticCreditBalanceState {
  balance?: CreditBalance;
  setBalance: (balance?: CreditBalance) => void;
  clear: () => void;
}

export const useOptimisticCreditBalanceStore = create<OptimisticCreditBalanceState>(set => ({
  balance: undefined,
  setBalance: balance => set({ balance }),
  clear: () => set({ balance: undefined }),
}));
