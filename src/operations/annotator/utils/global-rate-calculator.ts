import { annotatorStore, getAnnotationScreen } from '@/common/store';

export const isAnalyseRoofAnnotation = (annotation: Parameters<typeof getAnnotationScreen>[0]) =>
  getAnnotationScreen(annotation) === 'roof-analyse' && annotation.annotationInfos?.labelType === 'roof';

export const getAnalyseRoofAnnotation = () => Object.values(annotatorStore.useAnnotatorStore.getState().annotations).find(isAnalyseRoofAnnotation);

/**
 * Calculates the global degradation rate based on a weighted formula:
 * (α × wearLevel + β × moldRate + γ × humidityLevel)
 *
 * Weights:
 * α = 0.4 (Wear)
 * β = 0.8 (Mold)
 * γ = 1.0 (Humidity)
 *
 * @param annotationInfo - The annotation data containing the rates
 * @returns The calculated global rate
 */
export const calculateGlobalRate = (): { value: number; type: string } | null => {
  const analyseRoofAnnotation = getAnalyseRoofAnnotation();
  if (!analyseRoofAnnotation) return null;

  const annotationInfo = analyseRoofAnnotation.annotationInfos;
  const alpha = 0.4;
  const beta = 0.8;
  const gamma = 1.0;

  const wear = annotationInfo.wearLevel ?? 0;
  const mold = annotationInfo.moldRate ?? 0;
  const humidity = annotationInfo.humidityLevel ?? 0;

  const globalRate = alpha * wear + beta * mold + gamma * humidity;
  const value = parseFloat(globalRate.toFixed(2));

  let type = 'E';
  if (globalRate < 4) type = 'A';
  else if (globalRate >= 4 && globalRate < 11) type = 'B';
  else if (globalRate >= 11 && globalRate < 21) type = 'C';
  else if (globalRate >= 21 && globalRate < 41) type = 'D';

  return { value: value < 0 ? 0 : value > 100 ? 100 : value, type };
};
