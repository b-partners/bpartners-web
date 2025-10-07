import { annotationCoveringMapper, cache, getCached, Properties } from '@/providers';
import { useQuery } from '@tanstack/react-query';

const baseUrl = `${process.env.LLM_ANALYSE_RESULT}`;
const apiKey = `${process.env.LLM_API_KEY}`;

export const useLlmResultQuery = (roofAnnotatorProperties: Properties & { obstacle: boolean }) => {
  const { moisissure_rate, usure_rate, humidite_rate, roof_area_in_m2, revetement_1, obstacle, global_rate_value, global_rate_type } =
    roofAnnotatorProperties || {};
  const queryFn = async () => {
    const llmResult = getCached.llmResult();
    if (llmResult) return llmResult;

    const result = await fetch(
      `${baseUrl}?surfaceEnM2=${roof_area_in_m2}&revetement=${annotationCoveringMapper.fromAnalyseResultToDomain(revetement_1)}&moisissure=${moisissure_rate}&usure=${usure_rate}&obstacles=${JSON.stringify(obstacle)}&risqueFeu=false&fissureCassure=false&noteDegradationGlobale=${global_rate_value}&category=${global_rate_type}&humidit%C3%A9=${humidite_rate}&x-api-key=${apiKey}`
    );

    const _htmlResult = await result.text();
    const htmlResult = _htmlResult.split('</head>')[1];
    cache.llmResult(htmlResult || '');
    return htmlResult;
  };

  return useQuery({ queryFn, queryKey: [roofAnnotatorProperties] });
};
