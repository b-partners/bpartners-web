import { create } from 'zustand';

interface Action {
  setAnnotatorSidebarAccordionItem(value: number): void;
}

interface State {
  annotatorSidebarAccordionItem: number;
}

export const useAnnotatorComponentFormItemStore = create<Action & State>(set => ({
  annotatorSidebarAccordionItem: 0,
  setAnnotatorSidebarAccordionItem: value => set({ annotatorSidebarAccordionItem: value }),
}));
