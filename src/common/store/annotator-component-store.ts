import { create } from 'zustand';
import { SlopeAndHeightState } from '../fetcher';

interface AnalyseInformation {
  imageUrl: string;
  geoJsonResultUrl: string;
}

interface Action {
  setRoofSlope: (value: number) => void;
  setThereIsRoofPolygon: (value: boolean) => void;
  setAnalyseInformation: (value: AnalyseInformation) => void;
  setSlopeAndHeightState: (value: SlopeAndHeightState) => void;
  reset(): void;
}

interface State {
  roofSlope: number;
  thereIsRoofPolygon: boolean;
  imageUrl: string | null;
  geoJsonResultUrl: string | null;
  slopeAndHeightState: SlopeAndHeightState | null;
}

const defaultState: any = {
  thereIsRoofPolygon: false,
  imageUrl: null,
  geoJsonResultUrl: null,
  roofSlope: null,
  slopeAndHeightState: null,
};

export const useAnnotatorComponentStore = create<Action & State>(set => ({
  ...defaultState,
  setThereIsRoofPolygon: thereIsRoofPolygon => set({ thereIsRoofPolygon }),
  setSlopeAndHeightState: value => set({ slopeAndHeightState: value }),
  setAnalyseInformation: ({ geoJsonResultUrl, imageUrl }) => set({ geoJsonResultUrl, imageUrl }),
  reset: () => set(defaultState),
  setRoofSlope: roofSlope => set({ roofSlope }),
}));
