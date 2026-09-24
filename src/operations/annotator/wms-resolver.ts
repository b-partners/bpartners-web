import { awsAuth, getCached } from '@/providers';
import { GeoPoint, WmsLayerOption } from '@bpartners/roof-analyser';
import L from 'leaflet';

interface AreaPictureMapLayer {
  id: string;
  name: string;
  year?: number;
  precisionLevelInCm?: number;
}

/**
 * The BPartners API's `SecureLinkToken` — direct access to the GeoServer WMS through its nginx
 * `secure_link`: `value` goes on every GetMap as `token`, `expiresAtEpochSecond` as `expires`. It replaces
 * the Cognito token the cells used to be signed with — the GeoServer no longer sees a session token at all.
 */
interface SecureLinkToken {
  value: string;
  expiresAt?: string;
  expiresAtEpochSecond: number;
}

interface MapLayerReachability {
  layer: AreaPictureMapLayer;
  reachable: boolean;
}

/** One `secureLinkToken` for the whole candidate list: every candidate for a position answers off the same GeoServer. */
interface MapLayersReachability {
  layers: MapLayerReachability[];
  secureLinkToken: SecureLinkToken;
}

interface MapLayerActual {
  layer?: AreaPictureMapLayer;
  secureLinkToken: SecureLinkToken;
}

const readEnv = (value?: string) => {
  const trimmed = (value ?? '').trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const API_URL = readEnv(process.env.REACT_APP_BPARTNERS_API_URL);

/**
 * The GeoData lambda, now the address geocoder and nothing else — the layer lookup moved onto the
 * BPartners API. The old `REACT_APP_WMS_RESOLVER*` names are still read so a deployed env keeps working.
 */
const GEODATA_API_URL = readEnv(process.env.REACT_APP_GEODATA_API_URL) ?? readEnv(process.env.REACT_APP_WMS_RESOLVER);
const GEODATA_API_KEY = readEnv(process.env.REACT_APP_GEODATA_API_KEY) ?? readEnv(process.env.REACT_APP_WMS_RESOLVER_API_KEY);

/**
 * Where tiles are fetched from — never the `wmsBaseUrl` the MapLayer endpoints hand back. The secure link
 * answers for authentication, not for CORS: the library still reads every cell through `fetch` +
 * `createImageBitmap`, which needs a same-origin url, and the GeoServer sends no CORS headers.
 * `/wms-proxy` is the Vite dev server's own proxy (vite.config.ts); any deployed build must point this at
 * a same-origin proxy of its own.
 */
const WMS_TILE_BASE_URL = readEnv(process.env.REACT_APP_WMS_TILE_BASE_URL) ?? '/wms-proxy';

// The Cognito id token this app caches under `bp_access_token` at login — it authenticates the MapLayer
// calls on the BPartners API, and goes nowhere near the imagery. A live session is read back only when
// the cache is empty.
const sessionToken = async () => {
  const cachedToken = getCached.token().accessToken;
  if (cachedToken) return cachedToken;
  try {
    const session = await awsAuth.fetchAuthSession();
    return session?.tokens?.idToken?.toString() ?? '';
  } catch {
    return '';
  }
};

const sessionTokenOrThrow = async () => {
  const token = await sessionToken();
  if (!token) throw new Error('Aucun jeton de session — reconnectez-vous.');
  return token;
};

const fetchMapLayers = async <T>(path: string, latitude: number, longitude: number): Promise<T> => {
  if (!API_URL) throw new Error("L'imagerie n'est pas configurée — REACT_APP_BPARTNERS_API_URL est absent du .env.");
  const accessToken = await sessionTokenOrThrow();
  const response = await fetch(`${API_URL}${path}?lat=${latitude}&lon=${longitude}`, { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!response.ok) throw new Error(`${response.status} — ${(await response.text()).slice(0, 200)}`);
  return response.json();
};

const secureLinkOrThrow = (secureLinkToken?: SecureLinkToken) => {
  if (!secureLinkToken?.value) throw new Error("Aucun jeton d'accès à l'imagerie renvoyé par l'API.");
  return secureLinkToken;
};

const buildLayer = (
  { name, year, precisionLevelInCm }: AreaPictureMapLayer,
  { value, expiresAtEpochSecond }: SecureLinkToken,
  reachable?: boolean
): WmsLayerOption => ({
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
      token: value,
      expires: expiresAtEpochSecond,
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

// Built off the very layer the map fetches its cells from — same url, same wmsParams, same secure link —
// and read the same way, with `fetch`, so the probe cannot disagree with the real imagery.
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
 * sharing the pending check keeps that to a single request. Keyed by the secure link, so a token reissued
 * for the same position is checked afresh. A failed check is forgotten, so the next visit tries again.
 */
const checkImagery = (layer: WmsLayerOption, position: GeoPoint, secureLink: string) => {
  const key = `${WMS_TILE_BASE_URL}|${secureLink}|${position.latitude},${position.longitude}`;
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
 * The single layer the map opens on, off the BPartners API's `/map/layers/actual` — the fast half of the
 * pair: the library waits on this before it shows the map at all. Reachable by construction, so
 * `reachable` is left unset. The endpoint wraps the layer as `{ layer, secureLinkToken }`; a bare layer is
 * accepted too, provided a token comes with it.
 */
export const resolveActiveWmsLayer = async (latitude: number, longitude: number): Promise<WmsLayerOption> => {
  const body: MapLayerActual & Partial<AreaPictureMapLayer> = await fetchMapLayers('/map/layers/actual', latitude, longitude);
  const layer = body.layer ?? (body as AreaPictureMapLayer);
  if (!layer?.name) throw new Error('Aucune couche aérienne ne couvre cette position.');

  const secureLinkToken = secureLinkOrThrow(body.secureLinkToken);
  const option = buildLayer(layer, secureLinkToken);
  await checkImagery(option, { latitude, longitude }, secureLinkToken.value);
  return option;
};

/**
 * Every candidate layer, off the BPartners API's `/map/layers` — the slower half: each candidate is probed
 * for reachability server-side and only feeds the layer switcher, unreachable ones included (offered
 * disabled there). One secure link covers them all. The layer the library would fall back on is checked
 * the same way as the active one.
 */
export const resolveWmsLayers = async (latitude: number, longitude: number): Promise<WmsLayerOption[]> => {
  const { layers, secureLinkToken }: MapLayersReachability = await fetchMapLayers('/map/layers', latitude, longitude);
  const secureLink = secureLinkOrThrow(secureLinkToken);
  const options = (layers ?? []).map(({ layer, reachable }) => buildLayer(layer, secureLink, reachable));

  const fallback = options.find(option => option.reachable !== false) ?? options[0];
  if (fallback) await checkImagery(fallback, { latitude, longitude }, secureLink.value);
  return options;
};

const geodataKeyOrThrow = () => {
  if (!GEODATA_API_URL) throw new Error("Le géocodage n'est pas configuré — REACT_APP_GEODATA_API_URL est absent du .env.");
  const geodataKey = GEODATA_API_KEY || getCached.apiKey();
  if (!geodataKey) throw new Error('Aucune clé API — reconnectez-vous.');
  return geodataKey;
};

/** Still the GeoData lambda, on an `x-api-key` — turns the address into the position the lon/lat flow needs. */
export const geocodeAddress = async (address: string): Promise<GeoPoint> => {
  const response = await fetch(`${GEODATA_API_URL}/geocode?address=${encodeURIComponent(address)}`, { headers: { 'x-api-key': geodataKeyOrThrow() } });
  if (!response.ok) throw new Error(`${response.status} — ${(await response.text()).slice(0, 200)}`);
  const { longitude, latitude }: GeoPoint & { longitude: number } = await response.json();
  if (typeof latitude !== 'number' || typeof longitude !== 'number') throw new Error(`Aucune géoposition renvoyée pour « ${address} »`);
  return { latitude, longitude };
};
