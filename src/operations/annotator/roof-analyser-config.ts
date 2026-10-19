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

/**
 * Debug and tuning knobs on the generated roof, spread into `<RoofAnnotator>` only when set — blank keeps
 * the library's own defaults (`roofModelMarginM` 2 m, both tolerances 0.5 m, the near-vertex guard on).
 * `roofModelMarginM` is the margin added around the roof sent to the 3D generation (0 sends it as traced),
 * the tolerances merge and drop generated corners, and `roofNearVertexBlockEnabled` refuses a corner drag
 * that lands on another corner of the same pan.
 */
export const ROOF_MODEL_OPTIONS = definedOnly({
  roofModelMarginM: readNumberEnv(process.env.REACT_APP_ROOF_MODEL_MARGIN_M),
  roofSnapToleranceM: readNumberEnv(process.env.REACT_APP_ROOF_SNAP_TOLERANCE_M),
  roofSimplifyToleranceM: readNumberEnv(process.env.REACT_APP_ROOF_SIMPLIFY_TOLERANCE_M),
  roofNearVertexBlockEnabled: readBooleanEnv(process.env.REACT_APP_ROOF_NEAR_VERTEX_BLOCK_ENABLED),
});

/**
 * lon/lat flow only. `disableSwitchBack` (0.12.0+): once the analysis or the 3D generation has run, the
 * emprise they answer for stops being retraceable, so the 2D tab is closed for good — and the 3D screen's
 * own way back to the map goes with it; blank keeps the library's `false`, every tab reachable.
 * `autoDetectRoofFootprint` pre-fills a fresh visit's emprise from the backend's building footprint and
 * only ever applies in roofer mode (library default `true`), and `rooferButtonMode` is that guided walk
 * itself (default `false`; its **Terminer** button also needs an `onFinish`, which this screen does not pass).
 */
export const GEO_SESSION_OPTIONS = definedOnly({
  disableSwitchBack: readBooleanEnv(process.env.REACT_APP_ROOF_DISABLE_SWITCH_BACK),
  autoDetectRoofFootprint: readBooleanEnv(process.env.REACT_APP_ROOF_AUTO_DETECT_FOOTPRINT),
  rooferButtonMode: readBooleanEnv(process.env.REACT_APP_ROOF_ROOFER_BUTTON_MODE),
});

/**
 * Every service key `RoofAnalyserConfig` declares, `apiKey` and the account ids aside — those come from the
 * signed-in account (`use-roof-analyser-credentials.ts`). An absent variable leaves the key `undefined` and
 * the library falls back on its own default deployment.
 *
 * `intersectionsApiUrl` is the lidar planes and lines behind the *Aligner* step (`PUT /intersections/{id}`).
 * `threedApiUrl` (the pan-by-pan model, `PUT /lrg/{id}`) defaults to it, `geojobsApiKey` is sent to that
 * service as `geojobs-apikey` and falls back to `apiKey`, and `threedFilesProxyUrl` reads the generated
 * CityJSON through a proxy rather than its S3 origin, which sends no CORS header.
 */
export const ROOF_ANALYSER_CONFIG: Omit<RoofAnalyserConfig, 'apiKey'> = {
  apiUrl: readEnv(process.env.REACT_APP_BPARTNERS_API_URL),
  converterApiUrl: readEnv(process.env.REACT_APP_ANNOTATOR_PIXEL_CONVERTER_API_URL),
  geoConverterApiUrl: readEnv(process.env.REACT_APP_ANNOTATOR_GEO_CONVERTER_API_URL),
  geoMercatorApiUrl: readEnv(process.env.REACT_APP_ANNOTATOR_GEO_MERCATOR_API_URL),
  geoPixelApiUrl: readEnv(process.env.REACT_APP_ANNOTATOR_GEO_PIXEL_API_URL),
  detectionApiUrl: readEnv(process.env.REACT_APP_GEO_DETECTION_API),
  intersectionsApiUrl: readEnv(process.env.REACT_APP_ROOF_INTERSECTIONS_API_URL),
  threedApiUrl: readEnv(process.env.REACT_APP_ROOF_THREED_API_URL),
  threedFilesProxyUrl: readEnv(process.env.REACT_APP_ROOF_THREED_FILES_PROXY_URL),
  geojobsApiKey: readEnv(process.env.REACT_APP_ROOF_GEOJOBS_API_KEY),
  geocodeApiUrl: GEODATA_API_URL,
  geocodeApiKey: GEODATA_API_KEY,
  llmApiUrl: readEnv(process.env.LLM_ANALYSE_RESULT),
  llmApiKey: readEnv(process.env.LLM_API_KEY),
  geojsonBaseUrl: readEnv(process.env.REACT_APP_GEOJSON_BASEURL),
  wmsBaseUrl: readEnv(process.env.REACT_APP_WMS_BASE_URL),
};
