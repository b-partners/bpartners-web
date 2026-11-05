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
 * Debug and tuning knobs on the generated roof, spread into `<RoofAnnotator>` only when set — blank keeps
 * the library's own defaults (`roofModelMarginM` 2 m, both tolerances 0.5 m).
 * `roofModelMarginM` is the margin added around the roof sent to the 3D generation (0 sends it as traced)
 * and the tolerances merge and drop generated corners. The former `roofNearVertexBlockEnabled` is gone
 * since 0.17.0 — the library no longer takes it.
 */
export const ROOF_MODEL_OPTIONS = definedOnly({
  roofModelMarginM: readNumberEnv(process.env.REACT_APP_ROOF_MODEL_MARGIN_M),
  roofSnapToleranceM: readNumberEnv(process.env.REACT_APP_ROOF_SNAP_TOLERANCE_M),
  roofSimplifyToleranceM: readNumberEnv(process.env.REACT_APP_ROOF_SIMPLIFY_TOLERANCE_M),
});

/**
 * lon/lat flow only. `disableSwitchBack` (0.12.0+): once the analysis or the 3D generation has run, the
 * emprise they answer for stops being retraceable, so the 2D tab is closed for good — and the 3D screen's
 * own way back to the map goes with it; blank keeps the library's `false`, every tab reachable.
 * `autoDetectRoofFootprint` pre-fills a fresh visit's emprise from the backend's building footprint and
 * only ever applies in roofer mode (library default `true`), and `rooferButtonMode` is that guided walk
 * itself (default `false`; its **Terminer** button also needs an `onFinish`, which this screen does not pass).
 * `show3DResultOnly` (0.16.5+, each pan's own surface kept since 0.16.6) leaves the 3D tab as the
 * generation's read-out rather than something to measure on: the model still turns and a pan is still
 * picked and renamed, but no measuring bar, no cotes, no pente and no saved measures — the sidebar and the
 * exported PDF carry the roof's total surface and each pan's own, nothing more. Blank keeps `false`, the 3D
 * screen as it has always been, and it says nothing in `rooferButtonMode`, which drops that tab entirely.
 */
export const GEO_SESSION_OPTIONS = definedOnly({
  disableSwitchBack: readBooleanEnv(process.env.REACT_APP_ROOF_DISABLE_SWITCH_BACK),
  autoDetectRoofFootprint: readBooleanEnv(process.env.REACT_APP_ROOF_AUTO_DETECT_FOOTPRINT),
  rooferButtonMode: readBooleanEnv(process.env.REACT_APP_ROOF_ROOFER_BUTTON_MODE),
  show3DResultOnly: readBooleanEnv(process.env.REACT_APP_ROOF_SHOW_3D_RESULT_ONLY),
});

/**
 * Every service key `RoofAnalyserConfig` still declares, the credential and the account ids aside — those
 * come from the signed-in session (`use-roof-analyser-credentials.ts`). An absent variable leaves the key
 * `undefined` and the library falls back on its own production default.
 *
 * **0.17.0 routed every backend call through the Dashboard API**, so `apiUrl` is now the whole of the
 * configuration that matters: the records and every bridge — the geocoder (`/geodata/geocode`), the
 * imagery tiles (`/geoserver/wms`), the roof detection, the 3D generation and the LLM report — are read
 * from it on the Bearer token alone. The per-service keys that used to be handed over went with it
 * (`detectionApiUrl`, `geocodeApiUrl` / `geocodeApiKey`, `llmApiUrl` / `llmApiKey`, `wmsBaseUrl`); the
 * variables behind some of them are still read elsewhere in this app (`REACT_APP_GEO_DETECTION_API` by
 * `use-heart-beat.ts`), which is why they stay in the `.env`.
 *
 * `geoConverterApiUrl` is the one call that does not go to the Dashboard API, which bridges no converter.
 * It is a base url, not an endpoint: every point in the library goes through that one deployment both ways
 * — `{base}/mercator` reads a tile's pixels as lon/lat, `{base}/pixel` reads lon/lat back as that tile's
 * pixels. Point the variable at the deployment's root, with no path of its own.
 */
export const ROOF_ANALYSER_CONFIG: Omit<RoofAnalyserConfig, 'accessToken' | 'apiKey'> = {
  apiUrl: readEnv(process.env.REACT_APP_BPARTNERS_API_URL),
  geoConverterApiUrl: readEnv(process.env.REACT_APP_ANNOTATOR_GEO_CONVERTER_API_URL),
  geojsonBaseUrl: readEnv(process.env.REACT_APP_GEOJSON_BASEURL),
};
