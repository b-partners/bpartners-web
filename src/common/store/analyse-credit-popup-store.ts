import { create } from 'zustand';

interface AnalyseCreditPopupState {
  armed: boolean;
  visible: boolean;
  credits?: number;
  willDebit: boolean;
  prepare: (credits?: number, willDebit?: boolean) => void;
  arm: () => void;
  show: () => void;
  hide: () => void;
}

export const useAnalyseCreditPopupStore = create<AnalyseCreditPopupState>((set, get) => ({
  armed: false,
  visible: false,
  credits: undefined,
  willDebit: true,
  prepare: (credits, willDebit = true) => set({ credits, willDebit }),
  arm: () => set({ armed: get().willDebit }),
  show: () => set({ visible: true, armed: false }),
  hide: () => set({ visible: false }),
}));
