import { create } from 'zustand';
import { TProspectSearchStore } from './types';

export const useProspectSearchStore = create<TProspectSearchStore>(set => ({
  searchName: '',
  setSearchName: searchName => set({ searchName }),
}));
