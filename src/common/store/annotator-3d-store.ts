import { create } from 'zustand';

interface Action {
  selectObject: (object: any) => void;
  setSelectedObjectInfo: (object: any) => void;
  setShouldSelectSurface: (value: boolean) => void;
  reset: () => void;
}
interface State {
  selectedObject: any;
  selectedObjectInfo: any;
  shouldSelectSurface: boolean;
}

type Annotator3DStore = Action & State;

export const useAnnotator3DStore = create<Annotator3DStore>(set => ({
  selectedObject: null,
  selectObject: selectedObject => set({ selectedObject }),
  selectedObjectInfo: null,
  setSelectedObjectInfo: selectedObjectInfo => set({ selectedObjectInfo }),
  shouldSelectSurface: true,
  setShouldSelectSurface: shouldSelectSurface => set({ shouldSelectSurface }),
  reset: () => set({ selectedObject: null, selectedObjectInfo: null, shouldSelectSurface: true }),
}));
