import { getCached } from '@/providers';
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

export const resolveWmsLayers = async (latitude: number, longitude: number): Promise<WmsLayerOption[]> => {
  const { accessToken } = getCached.token();
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
  return layers.map(buildLayer);
};

export const geocodeAddress = async (address: string): Promise<GeoPoint> => {
  const { longitude, latitude }: GeoPoint & { longitude: number } = await resolverFetch(`/geocode?address=${encodeURIComponent(address)}`);
  if (typeof latitude !== 'number' || typeof longitude !== 'number') throw new Error(`Aucune géoposition renvoyée pour « ${address} »`);
  return { latitude, longitude };
};
