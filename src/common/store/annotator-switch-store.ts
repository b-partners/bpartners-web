import { create } from 'zustand';

interface State {
  screen: 'llm' | 'annotator' | '3d-annotator';
}

interface Action {
  setScreen(screen: State['screen']): void;
}

export const useAnnotatorScreenSwitch = create<State & Action>(set => ({
  screen: 'annotator',
  setScreen: screen => set({ screen }),
}));
