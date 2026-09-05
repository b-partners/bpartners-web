import { create } from 'zustand';
import { DraftAnnotationFilters, TDraftAnnotationFilterStore } from './types';

export const useDraftAnnotationFilterStore = create<TDraftAnnotationFilterStore>(set => ({
  filters: {},
  setFilter: (key, value) =>
    set(state => {
      const filters: DraftAnnotationFilters = { ...state.filters, [key]: value || undefined };
      return { filters };
    }),
  resetFilters: () => set({ filters: {} }),
}));
