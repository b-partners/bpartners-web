import { create } from 'zustand';

interface Action {
  setAnnotatorSidebarAnnordionItem(value: number): void;
}

interface State {
  annotatorSidebarAnnordionItem: number;
}

export const useAnnotatorComponentFormItemStore = create<Action & State>(set => ({
  annotatorSidebarAnnordionItem: 0,
  setAnnotatorSidebarAnnordionItem: value => set({ annotatorSidebarAnnordionItem: value }),
}));
