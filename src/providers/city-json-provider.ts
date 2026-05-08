import { retryUntilReady } from '@/common/fetcher';
import { Redirect } from '@/common/utils';
import { authProvider, getApiKey } from './auth-provider';

const baseUrl = (process.env.REACT_APP_GEO_DETECTION_API ?? '').replace(/\/$/g, '');

//TODO
export type CityJSONData = any;

export interface CityJSONUrl {
  id: string;
  url: string;
}

export enum CityJSONRequestStatus {
  FAILED = 'FAILED',
  SUCCESS = 'SUCCESS',
  PROCESSING = 'PROCESSING',
  UNAVAILABLE = 'UNAVAILABLE',
}

export interface CityJSONRequest {
  id: string;
  delimitations: object[];
  status: CityJSONRequestStatus;
  cityJsons: CityJSONUrl[];
}

interface ProcessCityJSONRequestParams {
  id: string;
  roofDelimiter: [number, number][][];
  usePan?: boolean;
  ltLong?: number;
  ltLat?: number;
  imageUrl?: string;
  resolution?: number;
}

export const processCityJSONRequest = async (params: ProcessCityJSONRequestParams) => {
  const { id, imageUrl, ltLat, ltLong, roofDelimiter, usePan, resolution } = params;
  const apiKey = await getApiKey();

  const threeDTextureInfo = usePan
    ? {
        imageDataUri: imageUrl,
        topLeftLon: ltLong,
        topLeftLat: ltLat,
        pixelWidth: resolution,
        pixelHeight: resolution,
      }
    : undefined;

  const response = await fetch(`${baseUrl}/city-jsons/${id}/process`, {
    method: 'PUT',
    headers: {
      'x-api-key': apiKey,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      id,
      delimitationObjectType: usePan ? 'BUILDING_ROOF_SEGMENT_FACE' : 'BUILDING_ROOF',
      delimitations: [
        {
          type: 'Feature',
          properties: {},
          geometry: {
            type: usePan ? 'MultiPolygon' : 'Polygon',
            coordinates: roofDelimiter,
          },
        },
      ],
      threeDTextureInfo,
    }),
  });

  if ([403, 401].includes(response.status)) {
    authProvider.logout().then(() => Redirect.toURL(`${location.hostname}/login`));
    throw new Error();
  }

  if (!response.ok) {
    throw new Error(`[CityJSONRequest] Status: FAILED — Unable to generate CityJSON.`);
  }

  return (await response.json()) as CityJSONRequest;
};

export const getCityJSON = async (params: ProcessCityJSONRequestParams) => {
  const cityJsonRequest = await retryUntilReady({
    maxAttemps: 20,
    sleepDelay: 7_000,
    fetcher: () => processCityJSONRequest(params),
    isReady: request => request.status !== CityJSONRequestStatus.PROCESSING,
  });

  if (cityJsonRequest.status === CityJSONRequestStatus.UNAVAILABLE) {
    throw new Error(`[CityJSONRequest] Status: UNAVAILABLE — CityJSON is currently unavailable.`);
  }

  if (cityJsonRequest.status == CityJSONRequestStatus.FAILED) {
    throw new Error(`[CityJSONRequest] Status: FAILED — Unable to generate CityJSON.`);
  }

  const urlResponse = await fetch(cityJsonRequest.cityJsons[0].url, { method: 'GET' });
  return (await urlResponse.json()) as CityJSONData;
};
