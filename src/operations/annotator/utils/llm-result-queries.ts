import { useAnnotatorComponentStore } from '@/common/store';
import { prodUrlPattern } from '@/constants';
import { annotationCoveringMapper, cache, getCached, Properties } from '@/providers';
import { useQuery } from '@tanstack/react-query';

const baseUrl = `${process.env.LLM_ANALYSE_RESULT}`;
const apiKey = `${process.env.LLM_API_KEY}`;

export const useLlmResultQuery = (roofAnnotatorProperties: Properties & { obstacle: boolean }) => {
  const { roofSlope } = useAnnotatorComponentStore();
  const isPreprod = !prodUrlPattern.test(window.location.href);
  const { moisissure_rate, usure_rate, humidite_rate, roof_area_in_m2, revetement_1, obstacle, global_rate_value } = roofAnnotatorProperties || {};
  const queryFn = async () => {
    const cachedResult = getCached.llmResult();

    if (cachedResult) return cachedResult;

    const result = await fetch(
      `${baseUrl}?surfaceEnM2=${roof_area_in_m2}&revetement=${annotationCoveringMapper.fromAnalyseResultToDomain(revetement_1).value}&moisissure=${moisissure_rate}&usure=${usure_rate}&obstacles=${JSON.stringify(obstacle)}&risqueFeu=false&fissureCassure=false&noteDegradationGlobale=${global_rate_value}&humidit%C3%A9=${humidite_rate}&penteMin=0&penteMax=${roofSlope}&x-api-key=${apiKey}`
    );

    const htmlResult = await result.text();

    cache.llmResult(htmlResult);
    return htmlResult;
  };

  return useQuery({ queryFn, queryKey: [roofAnnotatorProperties, roofSlope], enabled: isPreprod && !!roofSlope });
};
