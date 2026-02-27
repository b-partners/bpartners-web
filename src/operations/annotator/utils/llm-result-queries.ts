import { annotatorStore } from '@/common/store';
import { roofGlobalIdRef } from '@/operations/prospects/constants';
import { annotationCoveringMapper, cache } from '@/providers';
import { useQuery } from '@tanstack/react-query';
import { useShallow } from 'zustand/react/shallow';
import { calculateGlobalRate } from './global-rate-calculator';

const baseUrl = `${process.env.LLM_ANALYSE_RESULT}`;
const apiKey = `${process.env.LLM_API_KEY}`;

export const useLlmResultQuery = () => {
  const { annotationInfos } =
    annotatorStore.useAnnotatorStore(useShallow(p => Object.values(p.annotations).find(a => a.polygon.id.includes(roofGlobalIdRef)))) || {};
  const { moldRate, wearLevel, humidityLevel, comment, obstacle, area, covering } = annotationInfos || {};

  const queryFn = async () => {
    try {
      const globalRate = calculateGlobalRate();
      const result = await fetch(
        `${baseUrl}?surfaceEnM2=${area}&revetement=${annotationCoveringMapper.fromAnalyseResultToDomain(covering)}&moisissure=${moldRate}&usure=${wearLevel}&obstacles=${JSON.stringify(obstacle)}&risqueFeu=false&fissureCassure=false&noteDegradationGlobale=${globalRate.value}&category=${globalRate?.type}&humidit%C3%A9=${humidityLevel}&commentaireCouvreur=${comment || 'Pas de commentaire'}&x-api-key=${apiKey}`
      );

      const _htmlResult = await result.text();
      const htmlResult = _htmlResult.split('</head>')[1];
      cache.llmResult(htmlResult || '');
      return htmlResult;
    } catch (error) {
      console.log(error);
    }
  };

  return useQuery({
    queryFn,
    queryKey: [JSON.stringify({ moldRate, wearLevel, humidityLevel, comment, obstacle, area, covering })],
    enabled: !!annotationInfos && Object.values(annotationInfos || {}).length > 0,
  });
};
