import { create } from 'zustand';

interface AnalyseCreditPopupState {
  armed: boolean;
  visible: boolean;
  credits?: number;
  prepare: (credits?: number) => void;
  arm: () => void;
  show: () => void;
  hide: () => void;
}

export const useAnalyseCreditPopupStore = create<AnalyseCreditPopupState>(set => ({
  armed: false,
  visible: false,
  credits: undefined,
  prepare: credits => set({ credits }),
  arm: () => set({ armed: true }),
  show: () => set({ visible: true, armed: false }),
  hide: () => set({ visible: false }),
}));
