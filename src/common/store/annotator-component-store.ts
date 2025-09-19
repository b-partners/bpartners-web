import { create } from 'zustand';

interface AnalyseInformation {
  imageUrl: string;
  geoJsonResultUrl: string;
}

interface Action {
  setRoofSlope: (value: number) => void;
  setThereIsRoofPolygon: (value: boolean) => void;
  setAnalyseInformation: (value: AnalyseInformation) => void;
  reset(): void;
}

interface State {
  roofSlope: number;
  thereIsRoofPolygon: boolean;
  imageUrl: string | null;
  geoJsonResultUrl: string | null;
}

export const useAnnotatorComponentStore = create<Action & State>(set => ({
  setThereIsRoofPolygon: thereIsRoofPolygon => set({ thereIsRoofPolygon }),
  thereIsRoofPolygon: false,
  imageUrl: null,
  geoJsonResultUrl: null,
  roofSlope: null,
  setAnalyseInformation: ({ geoJsonResultUrl, imageUrl }) => set({ geoJsonResultUrl, imageUrl }),
  reset: () => set({ thereIsRoofPolygon: false, imageUrl: null, geoJsonResultUrl: null }),
  setRoofSlope: roofSlope => set({ roofSlope }),
}));
