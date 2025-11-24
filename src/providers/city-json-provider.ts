import { getApiKey } from './auth-provider';
import { retryUntilReady } from '@/common/fetcher';

const baseUrl = (process.env.REACT_APP_GEO_DETECTION_API ?? '').replace(/\/$/g, '');

//TODO
export type CityJSONData = any;

export interface CityJSONUrl {
  id: string;
  url: string;
}

export enum CityJSONRequestStatus {
  FAILED = "FAILED",
  SUCCESS = "SUCCESS",
  PROCESSING = "PROCESSING",
  UNAVAILABLE = "UNAVAILABLE"
}

export interface CityJSONRequest {
  id: string;
  delimitations: object[];
  status: CityJSONRequestStatus;
  cityJsons: CityJSONUrl[];
};

export const getCityJSON = async (id: string, roofDelimiter: [number, number][]) => {
  const apiKey = await getApiKey();

  const process: () => Promise<CityJSONRequest> = async () => {
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
            }

          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error("TODO: FAILED TO MAKE PROCESS");
    }

    return await response.json() as CityJSONRequest;
  };

  const cityJsonRequest = await retryUntilReady({
    fetcher: process,
    maxAttemps: 10,
    sleepDelay: 10_000,
    isReady: (request) => {
      //TODO: SHOW NOTIFICATION
      if (request.status === CityJSONRequestStatus.PROCESSING) {
        return false;
      }

      if (request.status === CityJSONRequestStatus.FAILED) {
        throw new Error("FAILED");
      }

      if (request.status === CityJSONRequestStatus.UNAVAILABLE) {
        throw new Error("UNAVAILABLE");
      }

      if (request.cityJsons.length === 0) {
        //TODO: should not happens
        throw new Error("EMPTY CITYJSONS");
      }

      return true;;
    }
  });

  const urlResponse = await fetch(cityJsonRequest.cityJsons[0].url, { method: "GET" });
  return await urlResponse.json() as CityJSONData;
};