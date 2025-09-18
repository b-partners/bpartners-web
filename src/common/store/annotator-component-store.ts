import { create } from 'zustand';

interface AnalyseInformation {
  imageUrl: string;
  geoJsonResultUrl: string;
}

interface Action {
  setThereIsRoofPolygon: (value: boolean) => void;
  setAnalyseInformation: (value: AnalyseInformation) => void;
}

interface State {
  thereIsRoofPolygon: boolean;
  imageUrl: string | null;
  geoJsonResultUrl: string | null;
}

export const useAnnotatorComponentStore = create<Action & State>(set => ({
  setThereIsRoofPolygon: value => set({ thereIsRoofPolygon: value }),
  thereIsRoofPolygon: false,
  imageUrl: null,
  geoJsonResultUrl: null,
  setAnalyseInformation: ({ geoJsonResultUrl, imageUrl }) => set({ geoJsonResultUrl, imageUrl }),
}));
