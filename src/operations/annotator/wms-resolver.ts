import { awsAuth, getCached } from '@/providers';
import { GeoPoint, WmsLayerOption } from '@bpartners/roof-analyser';
import L from 'leaflet';

interface AreaPictureMapLayer {
  id: string;
  name: string;
  year?: number;
  precisionLevelInCm?: number;
}

interface MapLayerReachability {
  layer: AreaPictureMapLayer;
  reachable: boolean;
}

interface MapLayersReachability {
  layers: MapLayerReachability[];
}

const readEnv = (value?: string) => {
  const trimmed = (value ?? '').trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const WMS_RESOLVER = readEnv(process.env.REACT_APP_WMS_RESOLVER);
const WMS_RESOLVER_API_KEY = readEnv(process.env.REACT_APP_WMS_RESOLVER_API_KEY);

/**
 * Where tiles are fetched from — never the `wmsBaseUrl` the MapLayer endpoints hand back. The library
 * reads every cell through `fetch` + `createImageBitmap`, which needs a same-origin, CORS-clean url, and
 * the GeoServer sends no CORS headers. `/wms-proxy` is the Vite dev server's own proxy (vite.config.ts);
 * any deployed build must point this at a same-origin proxy of its own.
 */
const WMS_TILE_BASE_URL = readEnv(process.env.REACT_APP_WMS_TILE_BASE_URL) ?? '/wms-proxy';

const resolverKeyOrThrow = () => {
  if (!WMS_RESOLVER) throw new Error("L'imagerie n'est pas configurée — REACT_APP_WMS_RESOLVER est absent du .env.");
  const resolverKey = WMS_RESOLVER_API_KEY || getCached.apiKey();
  if (!resolverKey) throw new Error('Aucune clé API — reconnectez-vous.');
  return resolverKey;
};

const resolverFetch = async (path: string) => {
  const response = await fetch(`${WMS_RESOLVER}${path}`, { headers: { 'x-api-key': resolverKeyOrThrow() } });
  if (!response.ok) throw new Error(`${response.status} — ${(await response.text()).slice(0, 200)}`);
  return response.json();
};

const mapLayersPath = (path: string, latitude: number, longitude: number) => `${path}?lat=${latitude}&lon=${longitude}`;

// The token GeoServer signs every GetMap with: the one this app caches under `bp_access_token` at login.
// A live session is read back only when the cache is empty.
const imageryToken = async () => {
  const cachedToken = getCached.token().accessToken;
  if (cachedToken) return cachedToken;
  try {
    const session = await awsAuth.fetchAuthSession();
    return session?.tokens?.idToken?.toString() ?? '';
  } catch {
    return '';
  }
};

const tokenOrThrow = async () => {
  const token = await imageryToken();
  if (!token) throw new Error("Aucun jeton de session pour l'imagerie — reconnectez-vous.");
  return token;
};

const buildLayer = ({ name, year, precisionLevelInCm }: AreaPictureMapLayer, token: string, reachable?: boolean): WmsLayerOption => ({
  name,
  year,
  precisionLevelInCm,
  reachable,
  create: () =>
    L.tileLayer.wms(WMS_TILE_BASE_URL, {
      layers: name,
      format: 'image/jpeg',
      transparent: true,
      version: '1.1.1',
      token,
      attribution: 'GeoServer WMS',
      tileSize: 1024,
      maxZoom: 24,
      maxNativeZoom: 21,
    } as L.WMSOptions),
});

const MERCATOR_HALF_WORLD = 20037508.34;
const PROBE_HALF_SIZE_M = 64;

const toMercator = ({ latitude, longitude }: GeoPoint) => ({
  x: (longitude * MERCATOR_HALF_WORLD) / 180,
  y: (Math.log(Math.tan(((90 + latitude) * Math.PI) / 360)) / (Math.PI / 180)) * (MERCATOR_HALF_WORLD / 180),
});

// Built off the very layer the map fetches its cells from — same url, same wmsParams, same token — and
// read the same way, with `fetch`, so the probe cannot disagree with the real imagery.
const probeUrl = (layer: L.TileLayer.WMS, position: GeoPoint) => {
  const { x, y } = toMercator(position);
  const params = new URLSearchParams({
    ...Object.fromEntries(Object.entries(layer.wmsParams).map(([key, value]) => [key, String(value)])),
    srs: 'EPSG:3857',
    bbox: `${x - PROBE_HALF_SIZE_M},${y - PROBE_HALF_SIZE_M},${x + PROBE_HALF_SIZE_M},${y + PROBE_HALF_SIZE_M}`,
    width: '64',
    height: '64',
  });
  return `${(layer as unknown as { _url: string })._url}?${params.toString()}`;
};

// A content type is checked as well as the status: a deployed build with no proxy behind
// REACT_APP_WMS_TILE_BASE_URL answers 200 with its own index.html.
const assertImageryReadable = async (layer: WmsLayerOption, position: GeoPoint) => {
  const response = await fetch(probeUrl(layer.create(), position));
  const contentType = response.headers.get('content-type') ?? '';
  if (!response.ok || !contentType.startsWith('image/')) {
    throw new Error(`L'imagerie n'a pas pu être chargée (HTTP ${response.status}) — vérifiez le proxy WMS (REACT_APP_WMS_TILE_BASE_URL).`);
  }
};

const imageryChecks = new Map<string, Promise<void>>();

/**
 * One check per position, shared by both resolvers. The library opens the map on whichever of them
 * yields a layer and reports an error only when both fail, so a refusal has to fail them together — and
 * sharing the pending check keeps that to a single request. A failed check is forgotten, so the next
 * visit tries again.
 */
const checkImagery = (layer: WmsLayerOption, position: GeoPoint, token: string) => {
  const key = `${WMS_TILE_BASE_URL}|${token}|${position.latitude},${position.longitude}`;
  const pending = imageryChecks.get(key);
  if (pending) return pending;
  const checking = assertImageryReadable(layer, position).catch(error => {
    imageryChecks.delete(key);
    throw error;
  });
  imageryChecks.set(key, checking);
  return checking;
};

/**
 * The single layer the map opens on, off `/map/layers/actual` — the fast half of the pair: the library
 * waits on this before it shows the map at all. Reachable by construction, so `reachable` is left unset.
 * The endpoint wraps the layer as `{ wmsBaseUrl, layer }`; a bare layer is accepted too.
 */
export const resolveActiveWmsLayer = async (latitude: number, longitude: number): Promise<WmsLayerOption> => {
  const token = await tokenOrThrow();
  const body: { layer?: AreaPictureMapLayer } & Partial<AreaPictureMapLayer> = await resolverFetch(mapLayersPath('/map/layers/actual', latitude, longitude));
  const layer = body.layer ?? (body as AreaPictureMapLayer);
  if (!layer?.name) throw new Error('Aucune couche aérienne ne couvre cette position.');

  const option = buildLayer(layer, token);
  await checkImagery(option, { latitude, longitude }, token);
  return option;
};

/**
 * Every candidate layer, off `/map/layers` — the slower half: each candidate is probed for reachability
 * server-side and only feeds the layer switcher, unreachable ones included (offered disabled there). The
 * layer the library would fall back on is checked the same way as the active one.
 */
export const resolveWmsLayers = async (latitude: number, longitude: number): Promise<WmsLayerOption[]> => {
  const token = await tokenOrThrow();
  const { layers }: MapLayersReachability = await resolverFetch(mapLayersPath('/map/layers', latitude, longitude));
  const options = (layers ?? []).map(({ layer, reachable }) => buildLayer(layer, token, reachable));

  const fallback = options.find(option => option.reachable !== false) ?? options[0];
  if (fallback) await checkImagery(fallback, { latitude, longitude }, token);
  return options;
};

export const geocodeAddress = async (address: string): Promise<GeoPoint> => {
  const { longitude, latitude }: GeoPoint & { longitude: number } = await resolverFetch(`/geocode?address=${encodeURIComponent(address)}`);
  if (typeof latitude !== 'number' || typeof longitude !== 'number') throw new Error(`Aucune géoposition renvoyée pour « ${address} »`);
  return { latitude, longitude };
};
