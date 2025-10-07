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
  setLlm: (value: string) => void;
  setGlobalRate: (value: number, type: string) => void;
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
  llm: string | null;
  globalRate: {
    type: string;
    value: number;
  } | null;
}

const defaultState: any = {
  thereIsRoofPolygon: false,
  imageUrl: null,
  geoJsonResultUrl: null,
  roofSlope: null,
  slopeAndHeightState: null,
  shouldGetHeightState: false,
  isSlopeAndHeightPending: false,
  llm: null,
  globalRate: null,
};

export const useAnnotatorComponentStore = create<Action & State>(set => ({
  ...defaultState,
  setThereIsRoofPolygon: thereIsRoofPolygon => set({ thereIsRoofPolygon }),
  setSlopeAndHeightState: value => set({ slopeAndHeightState: value }),
  setLlm: value => set({ llm: value }),
  setIsSlopeAndHeightPending: value => set({ isSlopeAndHeightPending: value }),
  setShouldGetHeightState: value => set({ shouldGetHeightState: value }),
  setAnalyseInformation: ({ geoJsonResultUrl, imageUrl }) => set({ geoJsonResultUrl, imageUrl }),
  reset: () => set(defaultState),
  setGlobalRate: (value, type) => set({ globalRate: { type, value } }),
  setRoofSlope: roofSlope => set({ roofSlope }),
}));
