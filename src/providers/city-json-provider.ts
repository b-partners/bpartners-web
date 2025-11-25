import { retryUntilReady } from '@/common/fetcher';
import { getApiKey } from './auth-provider';

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

export const processCityJSONRequest: (id: string, roofDelimiter: [number, number][]) => Promise<CityJSONRequest> = async (id, roofDelimiter) => {
  const apiKey = await getApiKey();

  const response = await fetch(`${baseUrl}/city-jsons/${id}/process`, {
    method: 'PUT',
    headers: {
      'x-api-key': apiKey,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      id,
      delimitations: [
        {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'Polygon',
            coordinates: [roofDelimiter],
          },
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to process CityJSON request (HTTP ${response.status})`);
  }

  return (await response.json()) as CityJSONRequest;
};

export const getCityJSON = async (id: string, roofDelimiter: [number, number][]) => {
  const cityJsonRequest = await retryUntilReady({
    maxAttemps: 15,
    sleepDelay: 7_000,
    fetcher: () => processCityJSONRequest(id, roofDelimiter),
    isReady: request => request.status !== CityJSONRequestStatus.PROCESSING,
  });

  if (cityJsonRequest.status === CityJSONRequestStatus.FAILED) {
    throw new Error(`[CityJSONRequest]: Failed to generate CityJSON`);
  }

  if (cityJsonRequest.status === CityJSONRequestStatus.UNAVAILABLE) {
    throw new Error('[CityJSONRequest]: CityJSON is unavailable');
  }

  const urlResponse = await fetch(cityJsonRequest.cityJsons[0].url, { method: 'GET' });
  return (await urlResponse.json()) as CityJSONData;
};
