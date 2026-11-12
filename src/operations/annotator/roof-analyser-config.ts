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
 * the library's own defaults (`roofModelMarginM` 2 m, both tolerances 0.5 m). `roofModelMarginM` is the
 * margin added around the roof sent to the 3D generation (0 sends it as traced), and the tolerances merge
 * and drop generated corners.
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
 * `apiUrl` is the only service url left to configure. Since 0.17.1 every downstream service is a bridge on
 * the Dashboard API itself — the records, the geocoder, the aerial imagery, the roof detection, the 3D
 * generation and the report all answer under that one host — and points are converted in-process, so the
 * former per-service keys (`geoConverterApiUrl`, `detectionApiUrl`, `geocodeApiUrl`, `geocodeApiKey`,
 * `llmApiUrl`, `llmApiKey`, `wmsBaseUrl`) no longer exist on `RoofAnalyserConfig`. An absent variable
 * leaves the key `undefined` and the library falls back on its own production deployment.
 *
 * The session token and the account ids are not here: they come from the signed-in account
 * (`use-roof-analyser-credentials.ts`). Every call the library makes — the records and the bridges
 * alike — carries that token as `Authorization: Bearer`; no api key is involved any more.
 */
export const ROOF_ANALYSER_CONFIG: Omit<RoofAnalyserConfig, 'accessToken'> = {
  apiUrl: readEnv(process.env.REACT_APP_BPARTNERS_API_URL),
  geojsonBaseUrl: readEnv(process.env.REACT_APP_GEOJSON_BASEURL),
};
