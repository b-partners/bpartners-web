import { RoofAnalyserConfig } from '@bpartners/roof-analyser';

const readEnv = (value?: string) => {
  const trimmed = (value ?? '').trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const readNumberEnv = (value?: string) => {
  const trimmed = readEnv(value);
  const parsed = trimmed === undefined ? NaN : Number(trimmed);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
};

const readBooleanEnv = (value?: string) => {
  const trimmed = readEnv(value)?.toLowerCase();
  return trimmed === 'true' || trimmed === 'false' ? trimmed === 'true' : undefined;
};

const definedOnly = <T extends object>(values: T) => Object.fromEntries(Object.entries(values).filter(([, value]) => value !== undefined)) as Partial<T>;

/**
 * The GeoData lambda, which the library geocodes against itself since 0.14.6 (`geocodeApiUrl` /
 * `geocodeApiKey`) — the same service this app's own `geocodeAddress` calls, handed over so an address
 * the library resolves on its own resolves against our env rather than its hardcoded production default.
 * The former `REACT_APP_WMS_RESOLVER*` names are still read as a fallback. A blank key is the signed-in
 * account's own, the library falling back on `apiKey`.
 */
const GEODATA_API_URL = readEnv(process.env.REACT_APP_GEODATA_API_URL) ?? readEnv(process.env.REACT_APP_WMS_RESOLVER);
const GEODATA_API_KEY = readEnv(process.env.REACT_APP_GEODATA_API_KEY) ?? readEnv(process.env.REACT_APP_WMS_RESOLVER_API_KEY);

export const ROOF_MODEL_MARGIN_M = readNumberEnv(process.env.REACT_APP_ROOF_MODEL_MARGIN_M);

export const ROOF_MODEL_OPTIONS = definedOnly({
  roofModelMarginM: ROOF_MODEL_MARGIN_M,
  roofSnapToleranceM: readNumberEnv(process.env.REACT_APP_ROOF_SNAP_TOLERANCE_M),
  roofSimplifyToleranceM: readNumberEnv(process.env.REACT_APP_ROOF_SIMPLIFY_TOLERANCE_M),
  roofNearVertexBlockEnabled: readBooleanEnv(process.env.REACT_APP_ROOF_NEAR_VERTEX_BLOCK_ENABLED),
});

/**
 * lon/lat flow only (0.12.0+): once the analysis or the 3D generation has run, the emprise they answer for
 * stops being retraceable, so `disableSwitchBack` closes the 2D tab for good — and drops the 3D screen's own
 * way back to the map with it. Blank keeps the library's default, which leaves every tab reachable.
 */
export const GEO_SESSION_OPTIONS = definedOnly({
  disableSwitchBack: readBooleanEnv(process.env.REACT_APP_ROOF_DISABLE_SWITCH_BACK),
});

export const ROOF_ANALYSER_CONFIG: Omit<RoofAnalyserConfig, 'apiKey'> = {
  apiUrl: readEnv(process.env.REACT_APP_BPARTNERS_API_URL),
  converterApiUrl: readEnv(process.env.REACT_APP_ANNOTATOR_PIXEL_CONVERTER_API_URL),
  geoConverterApiUrl: readEnv(process.env.REACT_APP_ANNOTATOR_GEO_CONVERTER_API_URL),
  geoMercatorApiUrl: readEnv(process.env.REACT_APP_ANNOTATOR_GEO_MERCATOR_API_URL),
  geoPixelApiUrl: readEnv(process.env.REACT_APP_ANNOTATOR_GEO_PIXEL_API_URL),
  detectionApiUrl: readEnv(process.env.REACT_APP_GEO_DETECTION_API),
  geocodeApiUrl: GEODATA_API_URL,
  geocodeApiKey: GEODATA_API_KEY,
  llmApiUrl: readEnv(process.env.LLM_ANALYSE_RESULT),
  llmApiKey: readEnv(process.env.LLM_API_KEY),
  geojsonBaseUrl: readEnv(process.env.REACT_APP_GEOJSON_BASEURL),
  wmsBaseUrl: readEnv(process.env.REACT_APP_WMS_BASE_URL),
};
