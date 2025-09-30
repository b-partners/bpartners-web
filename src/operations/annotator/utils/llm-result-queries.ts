import { prodUrlPattern } from '@/constants';
import { degradationLevels } from '@/operations/prospects/constants';
import { annotationCoveringMapper, cache, getCached, Properties } from '@/providers';
import { useQuery } from '@tanstack/react-query';

const baseUrl = `${process.env.LLM_ANALYSE_RESULT}`;
const apiKey = `${process.env.LLM_API_KEY}`;

export const useLlmResultQuery = (roofAnnotatorProperties: Properties & { obstacle: boolean }) => {
  const isPreprod = !prodUrlPattern.test(window.location.href);
  const { moisissure_rate, usure_rate, humidite_rate, roof_area_in_m2, revetement_1, obstacle, global_rate_value, global_rate_type } =
    roofAnnotatorProperties || {};
  const queryFn = async () => {
    const llmResult = getCached.llmResult();
    if (llmResult) return llmResult;

    const result = await fetch(
      `${baseUrl}?surfaceEnM2=${roof_area_in_m2}&revetement=${annotationCoveringMapper.fromAnalyseResultToDomainLabel(revetement_1)}&moisissure=${moisissure_rate}&usure=${usure_rate}&obstacles=${JSON.stringify(obstacle)}&risqueFeu=false&fissureCassure=false&noteDegradationGlobale=${global_rate_value}&humidit%C3%A9=${humidite_rate}&x-api-key=${apiKey}`
    );

    const categoryReplacePattern = /<span>[\s\S]*<\/h3>/;

    const htmlResult = await result.text();
    const currentDegradationLevel = degradationLevels.filter(({ label }) => label === global_rate_type)[0];
    cache.llmResult(htmlResult || '');
    return htmlResult.replace(
      categoryReplacePattern,
      `<span class='category-colored-round category-${global_rate_type}'></span>` +
        `CATÉGORIE ${global_rate_type}: ${currentDegradationLevel.name}`.toUpperCase() +
        '</h3>'
    );
  };

  return useQuery({ queryFn, queryKey: [roofAnnotatorProperties], enabled: isPreprod });
};
