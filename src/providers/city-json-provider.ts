import { retryUntilReady } from '@/common/fetcher';
import { Redirect } from '@/common/utils';
import { authProvider, getApiKey } from './auth-provider';

const baseUrl = (process.env.REACT_APP_GEO_DETECTION_API ?? '').replace(/\/$/g, '');

//TODO
export type CityJSONData = any;

export interface CityJsonFileUrl {
  id: string;
  url: string;
}

export enum ProgressionStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  FINISHED = 'FINISHED',
}

export enum HealthStatus {
  SUCCEEDED = 'SUCCEEDED',
  FAILED = 'FAILED',
  UNKNOWN = 'UNKNOWN',
  RETRYING = 'RETRYING',
}

export interface ThreeDResponseStatus {
  id: string;
  step: string;
  status: {
    progression: ProgressionStatus;
    health: HealthStatus;
  };
  delimitations: object[];
  cityJsonFileUrls: CityJsonFileUrl[];
}

interface ProcessCityJSONRequestParams {
  id: string;
  roofDelimiter: [number, number][][];
  usePan?: boolean;
  imageUrl?: string;
  tileX?: number;
  tileY?: number;
  tileImageSizePx?: number;
  imageWidth?: number;
  imageHeight?: number;
  zoom?: number;
}

export const processCityJSONRequest = async (params: ProcessCityJSONRequestParams, signal?: AbortSignal) => {
  const { id, imageUrl, roofDelimiter, usePan, imageHeight, imageWidth, zoom, tileX, tileY, tileImageSizePx } = params;
  const apiKey = await getApiKey();

  const threeDTextureInfo = {
    tileX,
    tileY,
    tileImageSizePx,
    imageWidth,
    imageHeight,
    zoom,
    imageUri: imageUrl,
  };

  const response = await fetch(`${baseUrl}/city-jsons/${id}/process`, {
    method: 'PUT',
    signal,
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
};

export const getThreeDStatus = async (id: string, signal?: AbortSignal) => {
  const apiKey = await getApiKey();

  const response = await fetch(`${baseUrl}/3d/${id}`, {
    method: 'GET',
    signal,
    headers: {
      'x-api-key': apiKey,
    },
  });

  if ([403, 401].includes(response.status)) {
    authProvider.logout().then(() => Redirect.toURL(`${location.hostname}/login`));
    throw new Error();
  }

  if (!response.ok) {
    throw new Error(`[ThreeD] Status: FAILED — Unable to get 3D status.`);
  }

  return (await response.json()) as ThreeDResponseStatus;
};

const inflightCityJSON = new Map<string, Promise<CityJSONData>>();

const dedupeById = (id: string, run: () => Promise<CityJSONData>) => {
  const existing = inflightCityJSON.get(id);
  if (existing) return existing;

  const promise = run().finally(() => inflightCityJSON.delete(id));
  inflightCityJSON.set(id, promise);
  return promise;
};

export const getExistingCityJSON = (id: string, signal?: AbortSignal) =>
  dedupeById(id, async () => {
    const threeDResponse = await retryUntilReady({
      maxAttemps: 20,
      sleepDelay: 7_000,
      signal,
      fetcher: () => getThreeDStatus(id, signal),
      isReady: response => response.status.progression !== ProgressionStatus.PROCESSING && response.status.progression !== ProgressionStatus.PENDING,
    });

    if (threeDResponse.status.health === HealthStatus.FAILED) {
      throw new Error(`[ThreeD] Status: FAILED — Unable to generate CityJSON.`);
    }

    if (threeDResponse.status.health === HealthStatus.UNKNOWN) {
      throw new Error(`[ThreeD] Status: UNAVAILABLE — CityJSON is currently unavailable.`);
    }

    if (!threeDResponse.cityJsonFileUrls?.length) {
      throw new Error(`[ThreeD] Status: FAILED — No CityJSON files available.`);
    }

    const urlResponse = await fetch(threeDResponse.cityJsonFileUrls[0].url, { method: 'GET', signal });
    return (await urlResponse.json()) as CityJSONData;
  });

export const getCityJSON = (params: ProcessCityJSONRequestParams, onProcessSuccess?: () => void, signal?: AbortSignal) =>
  dedupeById(params.id, async () => {
    await retryUntilReady({
      maxAttemps: 5,
      sleepDelay: 3_000,
      signal,
      fetcher: async () => {
        await processCityJSONRequest(params, signal);
        return true;
      },
      isReady: () => true,
    });

    onProcessSuccess?.();

    const threeDResponse = await retryUntilReady({
      maxAttemps: 20,
      sleepDelay: 7_000,
      signal,
      fetcher: () => getThreeDStatus(params.id, signal),
      isReady: response => response.status.progression !== ProgressionStatus.PROCESSING && response.status.progression !== ProgressionStatus.PENDING,
    });

    if (threeDResponse.status.health === HealthStatus.FAILED) {
      throw new Error(`[ThreeD] Status: FAILED — Unable to generate CityJSON.`);
    }

    if (threeDResponse.status.health === HealthStatus.UNKNOWN) {
      throw new Error(`[ThreeD] Status: UNAVAILABLE — CityJSON is currently unavailable.`);
    }

    if (!threeDResponse.cityJsonFileUrls?.length) {
      throw new Error(`[ThreeD] Status: FAILED — No CityJSON files available.`);
    }

    const urlResponse = await fetch(threeDResponse.cityJsonFileUrls[0].url, { method: 'GET', signal });
    return (await urlResponse.json()) as CityJSONData;
  });
