import { annotatorStore, getAnnotationScreen, useAnnotatorComponentStore } from '@/common/store';
import { printError } from '@/common/utils';
import { getRoofOverallScore } from '@/providers';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useShallow } from 'zustand/react/shallow';

export const isAnalyseRoofAnnotation = (annotation: Parameters<typeof getAnnotationScreen>[0]) =>
  getAnnotationScreen(annotation) === 'roof-analyse' && annotation.annotationInfos?.labelType === 'roof';

export const getAnalyseRoofAnnotation = () => Object.values(annotatorStore.useAnnotatorStore.getState().annotations).find(isAnalyseRoofAnnotation);

const GLOBAL_RATE_THRESHOLDS: [number, string][] = [
  [4, 'A'],
  [11, 'B'],
  [21, 'C'],
  [41, 'D'],
];

/**
 * Fallback formula used only when the /roof/overallScore backend computation is unreachable:
 * (α × wearLevel + β × moldRate + γ × humidityLevel)
 */
export const computeLocalGlobalRate = (wear: number, mold: number, humidity: number): { value: number; type: string } => {
  const alpha = 0.4;
  const beta = 0.8;
  const gamma = 1.0;

  const globalRate = alpha * wear + beta * mold + gamma * humidity;
  const value = parseFloat(globalRate.toFixed(2));
  const type = GLOBAL_RATE_THRESHOLDS.find(([max]) => globalRate < max)?.[1] ?? 'E';

  return { value: value < 0 ? 0 : value > 100 ? 100 : value, type };
};

export const useGlobalRateQuery = (): { value: number; type: string } | null => {
  const analyseRoofAnnotation = annotatorStore.useAnnotatorStore(useShallow(state => Object.values(state.annotations).find(isAnalyseRoofAnnotation)));
  const setGlobalRate = useAnnotatorComponentStore(state => state.setGlobalRate);

  const wear = analyseRoofAnnotation?.annotationInfos.wearLevel ?? 0;
  const mold = analyseRoofAnnotation?.annotationInfos.moldRate ?? 0;
  const humidity = analyseRoofAnnotation?.annotationInfos.humidityLevel ?? 0;
  const localFallback = computeLocalGlobalRate(wear, mold, humidity);

  const { data } = useQuery({
    queryKey: ['roofOverallScore', wear, mold, humidity],
    queryFn: async () => {
      try {
        const { score, category } = await getRoofOverallScore(wear, mold, humidity);
        return { value: score, type: category };
      } catch (error) {
        printError(error);
        return localFallback;
      }
    },
    enabled: !!analyseRoofAnnotation,
    placeholderData: localFallback,
  });

  const globalRate = analyseRoofAnnotation ? data ?? localFallback : null;

  useEffect(() => {
    if (globalRate) setGlobalRate(globalRate.value, globalRate.type);
  }, [globalRate?.value, globalRate?.type, setGlobalRate]);

  return globalRate;
};
