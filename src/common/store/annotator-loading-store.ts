import { create } from 'zustand';

interface State {
  is3DLoading: boolean;
  isAnalyseLoading: boolean;
}

interface Action {
  setIs3DLoading: (value: boolean) => void;
  setIsAnalyseLoading: (value: boolean) => void;
}

export const useAnnotatorLoadingStore = create<State & Action>(set => ({
  is3DLoading: false,
  isAnalyseLoading: false,
  setIs3DLoading: is3DLoading => set({ is3DLoading }),
  setIsAnalyseLoading: isAnalyseLoading => set({ isAnalyseLoading }),
}));
