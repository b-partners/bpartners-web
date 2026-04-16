import { annotatorStore } from '@/common/store';
import { annotationCoveringMapper, cache } from '@/providers';
import { useQuery } from '@tanstack/react-query';
import { useShallow } from 'zustand/react/shallow';
import { calculateGlobalRate } from './global-rate-calculator';

const baseUrl = `${process.env.LLM_ANALYSE_RESULT}`;
const apiKey = `${process.env.LLM_API_KEY}`;

export const useLlmResultQuery = () => {
  const { annotationInfos, polygon } = annotatorStore.useAnnotatorStore(useShallow(p => Object.values(p.annotations).find(a => a.isFirst))) || {};

  const { moldRate, wearLevel, humidityLevel, comment, obstacle, area: _area, covering } = annotationInfos || {};

  const area = _area || polygon.surface;

  const queryFn = async () => {
    try {
      const globalRate = calculateGlobalRate();
      const result = await fetch(
        `${baseUrl}?surfaceEnM2=${area}&revetement=${annotationCoveringMapper.fromAnalyseResultToDomain(covering)}&moisissure=${moldRate || 0}&usure=${wearLevel || 0}&obstacles=${obstacle ? JSON.stringify(obstacle) : 'Non définie'}&risqueFeu=false&fissureCassure=false&noteDegradationGlobale=${globalRate.value}&category=${globalRate?.type}&humidit%C3%A9=${humidityLevel || 0}&commentaireCouvreur=${comment || 'Pas de commentaire'}&x-api-key=${apiKey}`
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
