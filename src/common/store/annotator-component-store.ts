import { create } from 'zustand';

interface Action {
  setThereIsRoofPolygon: (value: boolean) => void;
}

interface State {
  thereIsRoofPolygon: boolean;
}

export const useAnnotatorComponentStore = create<Action & State>(set => ({
  setThereIsRoofPolygon: value => set({ thereIsRoofPolygon: value }),
  thereIsRoofPolygon: false,
}));
