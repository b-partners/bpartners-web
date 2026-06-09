import { create } from 'zustand';

interface State {
  screen: 'llm' | 'annotator' | '3d-annotator' | 'roof-analyse';
  threeDMode: 'pan' | 'roof';
}

interface Action {
  setScreen(screen: State['screen'], threeDMode?: State['threeDMode']): void;
}

export const useAnnotatorScreenSwitch = create<State & Action>(set => ({
  screen: 'annotator',
  threeDMode: 'roof',
  setScreen: (screen, threeDMode) => set({ screen, threeDMode: threeDMode ?? 'roof' }),
}));
