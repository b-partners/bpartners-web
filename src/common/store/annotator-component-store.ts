import { AnnotationCoveringFromAnalyse } from '@/providers';
import { AreaPictureDetails } from '@bpartners/typescript-client';
import { create } from 'zustand';
import { SlopeAndHeightState } from '../fetcher';
import { copyObject } from '../utils';
import type { CropRegion } from '@/operations/annotator/utils/image-and-polygon-cropper';

interface AnalyseInformation {
  imageUrl: string;
  geoJsonResultUrl: string;
}

export interface RoofAnalyseProperties {
  obstacle: boolean;
  usure_rate: number;
  global_rate_value: number;
  global_rate_type: string;
  moisissure_rate: number;
  humidite_rate: number;
  revetement_1: AnnotationCoveringFromAnalyse;
  revetement_2: AnnotationCoveringFromAnalyse | null;
  roof_area_in_m2: number;
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
  setAreaPictureDetails: (areaPictureDetails: AreaPictureDetails) => void;
  reset(): void;
  setRoofDelimiter(roofDelimiter: any): void;
  setImageTileInfoOrigin?: (imageTileInfoOrigin: any) => void;
  setRoofAnalyseProperties: (roofAnalyseProperties: RoofAnalyseProperties) => void;
  setAnalyseImageUrl: (analyseImageUrl: string | null) => void;
  setAnalyseImageFileId: (analyseImageFileId: string | null) => void;
  setAnalyseLoadingPolygon: (analyseLoadingPolygon: { x: number; y: number }[] | null) => void;
  setCropRegion: (cropRegion: CropRegion | null) => void;
}

interface State {
  roofSlope: number;
  thereIsRoofPolygon: boolean;
  imageUrl: string | null;
  geoJsonResultUrl: string | null;
  slopeAndHeightState: SlopeAndHeightState | null;
  shouldGetHeightState: boolean;
  isSlopeAndHeightPending: boolean;
  areaPictureDetails: AreaPictureDetails;
  roofDelimiter?: {
    polygon: [number, number][];
  };
  imageTileInfoOrigin?: any;
  llm: string | null;
  globalRate: {
    type: string;
    value: number;
  } | null;
  roofAnalyseProperties?: RoofAnalyseProperties;
  analyseImageUrl: string | null;
  analyseImageFileId: string | null;
  analyseLoadingPolygon: { x: number; y: number }[] | null;
  cropRegion: CropRegion | null;
}

const defaultState: any = {
  thereIsRoofPolygon: false,
  imageUrl: null,
  geoJsonResultUrl: null,
  roofSlope: null,
  areaPictureDetails: null,
  slopeAndHeightState: null,
  shouldGetHeightState: false,
  isSlopeAndHeightPending: false,
  llm: null,
  globalRate: null,
  analyseImageUrl: null,
  analyseImageFileId: null,
  analyseLoadingPolygon: null,
  cropRegion: null,
};

export const useAnnotatorComponentStore = create<Action & State>(set => ({
  ...copyObject(defaultState),
  setThereIsRoofPolygon: thereIsRoofPolygon => set({ thereIsRoofPolygon }),
  setSlopeAndHeightState: value => set({ slopeAndHeightState: value }),
  setLlm: value => set({ llm: value }),
  setIsSlopeAndHeightPending: value => set({ isSlopeAndHeightPending: value }),
  setShouldGetHeightState: value => set({ shouldGetHeightState: value }),
  setAnalyseInformation: ({ geoJsonResultUrl, imageUrl }) => set({ geoJsonResultUrl, imageUrl }),
  reset: () => set(copyObject(defaultState)),
  setGlobalRate: (value, type) => set({ globalRate: { type, value } }),
  setRoofSlope: roofSlope => set({ roofSlope }),
  setAreaPictureDetails: areaPictureDetails => set({ areaPictureDetails }),
  setRoofDelimiter: roofDelimiter => set({ roofDelimiter }),
  setImageTileInfoOrigin: imageTileInfoOrigin => set({ imageTileInfoOrigin }),
  setRoofAnalyseProperties: roofAnalyseProperties => set({ roofAnalyseProperties }),
  setAnalyseImageUrl: analyseImageUrl => set({ analyseImageUrl }),
  setAnalyseImageFileId: analyseImageFileId => set({ analyseImageFileId }),
  setAnalyseLoadingPolygon: analyseLoadingPolygon => set({ analyseLoadingPolygon }),
  setCropRegion: cropRegion => set({ cropRegion }),
}));
