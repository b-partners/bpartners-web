import { create } from 'zustand';

interface AnalyseCreditPopupState {
  armed: boolean;
  visible: boolean;
  credits?: number;
  arm: () => void;
  show: (credits?: number) => void;
  hide: () => void;
}

export const useAnalyseCreditPopupStore = create<AnalyseCreditPopupState>(set => ({
  armed: false,
  visible: false,
  credits: undefined,
  arm: () => set({ armed: true }),
  show: credits => set({ visible: true, credits, armed: false }),
  hide: () => set({ visible: false }),
}));
