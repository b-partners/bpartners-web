import { awsAuth, getCached } from '@/providers';
import { GeoPoint, WmsLayerOption } from '@bpartners/roof-analyser';
import L from 'leaflet';

interface AreaPictureMapLayer {
  id: string;
  name: string;
  year?: number;
  precisionLevelInCm?: number;
}

interface AreaPictureMapLayerAvailability {
  wmsBaseUrl: string;
  availableLayers: AreaPictureMapLayer[];
  actualLayer: AreaPictureMapLayer;
}

const readEnv = (value?: string) => {
  const trimmed = (value ?? '').trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const WMS_RESOLVER = readEnv(process.env.REACT_APP_WMS_RESOLVER);
const WMS_RESOLVER_API_KEY = readEnv(process.env.REACT_APP_WMS_RESOLVER_API_KEY);

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

// GeoServer validates the Cognito id token on every GetMap, so it has to be a live one: the cached copy
// is only refreshed on login/whoami and is already expired an hour into a session.
const freshIdToken = async () => {
  try {
    const session = await awsAuth.fetchAuthSession();
    return session?.tokens?.idToken?.toString() || getCached.token().accessToken;
  } catch {
    return getCached.token().accessToken;
  }
};

const MERCATOR_HALF_WORLD = 20037508.34;
const PROBE_HALF_SIZE_M = 64;
const PROBE_TIMEOUT_MS = 8000;

const toMercator = ({ latitude, longitude }: GeoPoint) => ({
  x: (longitude * MERCATOR_HALF_WORLD) / 180,
  y: (Math.log(Math.tan(((90 + latitude) * Math.PI) / 360)) / (Math.PI / 180)) * (MERCATOR_HALF_WORLD / 180),
});

// The map loads its imagery as a plain <img>, so a refused GetMap is a silent blank map rather than an
// error. One probe on the same terms turns that into something the screen can say out loud. It fails
// open: only an actual load error counts as a refusal.
const isImageryReadable = (wmsBaseUrl: string, layer: string, position: GeoPoint, token: string): Promise<boolean> => {
  if (!layer) return Promise.resolve(true);
  const { x, y } = toMercator(position);
  const params = new URLSearchParams({
    SERVICE: 'WMS',
    VERSION: '1.1.1',
    REQUEST: 'GetMap',
    LAYERS: layer,
    STYLES: '',
    SRS: 'EPSG:3857',
    BBOX: `${x - PROBE_HALF_SIZE_M},${y - PROBE_HALF_SIZE_M},${x + PROBE_HALF_SIZE_M},${y + PROBE_HALF_SIZE_M}`,
    WIDTH: '64',
    HEIGHT: '64',
    FORMAT: 'image/jpeg',
    token,
  });

  return new Promise(resolve => {
    const image = new Image();
    const timeout = setTimeout(() => resolve(true), PROBE_TIMEOUT_MS);
    const settle = (isReadable: boolean) => {
      clearTimeout(timeout);
      resolve(isReadable);
    };
    image.onload = () => settle(true);
    image.onerror = () => settle(false);
    image.src = `${wmsBaseUrl}?${params.toString()}`;
  });
};

export const resolveWmsLayers = async (latitude: number, longitude: number): Promise<WmsLayerOption[]> => {
  const accessToken = await freshIdToken();
  if (!accessToken) throw new Error("Aucun jeton de session pour l'imagerie — reconnectez-vous.");

  const { wmsBaseUrl, availableLayers, actualLayer }: AreaPictureMapLayerAvailability = await resolverFetch(
    `/areaPictureMapLayers/availability?lat=${latitude}&lon=${longitude}`
  );

  const buildLayer = ({ name, year, precisionLevelInCm }: AreaPictureMapLayer): WmsLayerOption => ({
    name,
    year,
    precisionLevelInCm,
    create: () =>
      L.tileLayer.wms(wmsBaseUrl, {
        layers: name,
        format: 'image/jpeg',
        transparent: true,
        version: '1.1.1',
        token: accessToken,
        attribution: 'GeoServer WMS',
        tileSize: 1024,
        maxZoom: 24,
        maxNativeZoom: 21,
      } as L.WMSOptions),
  });

  const layers = [actualLayer, ...(availableLayers ?? [])].filter((layer, index, all) => all.findIndex(other => other.name === layer.name) === index);
  if (!(await isImageryReadable(wmsBaseUrl, layers[0]?.name, { latitude, longitude }, accessToken))) {
    throw new Error("L'imagerie a refusé le jeton de session : le GeoServer n'accepte pas ce compte. Reconnectez-vous, ou vérifiez l'environnement du .env.");
  }
  return layers.map(buildLayer);
};

export const geocodeAddress = async (address: string): Promise<GeoPoint> => {
  const { longitude, latitude }: GeoPoint & { longitude: number } = await resolverFetch(`/geocode?address=${encodeURIComponent(address)}`);
  if (typeof latitude !== 'number' || typeof longitude !== 'number') throw new Error(`Aucune géoposition renvoyée pour « ${address} »`);
  return { latitude, longitude };
};
