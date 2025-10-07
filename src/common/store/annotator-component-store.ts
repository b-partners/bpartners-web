import { create } from 'zustand';
import { SlopeAndHeightState } from '../fetcher';

interface AnalyseInformation {
  imageUrl: string;
  geoJsonResultUrl: string;
}

interface Action {
  setRoofSlope: (value: number) => void;
  setThereIsRoofPolygon: (value: boolean) => void;
  setIsSlopeAndHeightPending: (value: boolean) => void;
  setShouldGetHeightState: (value: boolean) => void;
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
  shouldGetHeightState: boolean;
  isSlopeAndHeightPending: boolean;
}

const defaultState: any = {
  thereIsRoofPolygon: false,
  imageUrl: null,
  geoJsonResultUrl: null,
  roofSlope: null,
  slopeAndHeightState: null,
  shouldGetHeightState: false,
  isSlopeAndHeightPending: false,
};

export const useAnnotatorComponentStore = create<Action & State>(set => ({
  ...defaultState,
  setThereIsRoofPolygon: thereIsRoofPolygon => set({ thereIsRoofPolygon }),
  setSlopeAndHeightState: value => set({ slopeAndHeightState: value }),
  setIsSlopeAndHeightPending: value => set({ isSlopeAndHeightPending: value }),
  setShouldGetHeightState: value => set({ shouldGetHeightState: value }),
  setAnalyseInformation: ({ geoJsonResultUrl, imageUrl }) => set({ geoJsonResultUrl, imageUrl }),
  reset: () => set(defaultState),
  setRoofSlope: roofSlope => set({ roofSlope }),
}));
