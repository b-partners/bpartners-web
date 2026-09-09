import { RoofAnalyserConfig } from '@bpartners/roof-analyser';

const readEnv = (value?: string) => {
  const trimmed = (value ?? '').trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

export const ROOF_ANALYSER_CONFIG: Omit<RoofAnalyserConfig, 'apiKey'> = {
  apiUrl: readEnv(process.env.REACT_APP_BPARTNERS_API_URL),
  converterApiUrl: readEnv(process.env.REACT_APP_ANNOTATOR_PIXEL_CONVERTER_API_URL),
  geoConverterApiUrl: readEnv(process.env.REACT_APP_ANNOTATOR_GEO_CONVERTER_API_URL),
  geoMercatorApiUrl: readEnv(process.env.REACT_APP_ANNOTATOR_GEO_MERCATOR_API_URL),
  geoPixelApiUrl: readEnv(process.env.REACT_APP_ANNOTATOR_GEO_PIXEL_API_URL),
  detectionApiUrl: readEnv(process.env.REACT_APP_GEO_DETECTION_API),
  llmApiUrl: readEnv(process.env.LLM_ANALYSE_RESULT),
  llmApiKey: readEnv(process.env.LLM_API_KEY),
  geojsonBaseUrl: readEnv(process.env.REACT_APP_GEOJSON_BASEURL),
  wmsBaseUrl: readEnv(process.env.REACT_APP_WMS_BASE_URL),
};
