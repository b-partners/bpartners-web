import { create } from 'zustand';

interface Action {
  selectObject: (object: any) => void;
  setSelectedObjectInfo: (object: any) => void;
  setShouldSelectSurface: (value: boolean) => void;
  setCityJsonModel: (value: any) => void;
  reset: () => void;
  setImageUrl: (imageUrl: File) => void;
  incrementRegenerateVersion: () => void;
}
interface State {
  selectedObject: any;
  selectedObjectInfo: any;
  shouldSelectSurface: boolean;
  cityJsonModel: any;
  imageUrl: File;
  regenerateVersion: number;
}

type Annotator3DStore = Action & State;

export const useAnnotator3DStore = create<Annotator3DStore>(set => ({
  selectedObject: null,
  selectObject: selectedObject => set({ selectedObject }),
  selectedObjectInfo: null,
  setSelectedObjectInfo: selectedObjectInfo => set({ selectedObjectInfo }),
  shouldSelectSurface: true,
  setShouldSelectSurface: shouldSelectSurface => set({ shouldSelectSurface }),
  cityJsonModel: null,
  setCityJsonModel: cityJsonModel => set({ cityJsonModel }),
  reset: () => set({ selectedObject: null, selectedObjectInfo: null, shouldSelectSurface: true, cityJsonModel: null, imageUrl: null }),
  imageUrl: null,
  setImageUrl: imageUrl => set({ imageUrl }),
  regenerateVersion: 0,
  incrementRegenerateVersion: () => set(state => ({ regenerateVersion: state.regenerateVersion + 1 })),
}));
