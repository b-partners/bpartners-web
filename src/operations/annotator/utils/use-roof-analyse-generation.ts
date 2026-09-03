import { useRoofAnalyseQuery } from '@/common/fetcher';
import {
  annotatorStore,
  getAnnotationScreen,
  useAnalyseCreditPopupStore,
  useAnnotatorComponentStore,
  useAnnotatorScreenSwitch,
  useOptimisticCreditBalanceStore,
} from '@/common/store';
import { computeOptimisticBalance, getEffectiveCreditBalance, useCreditRequirement } from '@/operations/account/components/billing';
import { CREDIT_BALANCE_QUERY_KEY } from '@/operations/account/queries';
import { clearPolygons, removeCache } from '@/providers';
import { CreditBalance } from '@bpartners/typescript-client';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { isAfterAnalyse } from './is-after-analyse';
import { shiftPolygons } from './shift-polygons';

export interface RoofAnalyseGeneration {
  runAnalyse: () => Promise<void>;
  isAnalysing: boolean;
  isAlreadyAnalysed: boolean;
  isThereARoofPolygon: boolean;
  isPrecisionLevelInCmCorrect: boolean;
}

export const useRoofAnalyseGeneration = (): RoofAnalyseGeneration => {
  const { screen } = useAnnotatorScreenSwitch();
  const { requireCredits } = useCreditRequirement();
  const queryClient = useQueryClient();
  const prepareCreditPopup = useAnalyseCreditPopupStore(params => params.prepare);
  const setOptimisticBalance = useOptimisticCreditBalanceStore(params => params.setBalance);
  const {
    areaPictureDetails,
    analyseImageUrl,
    analyseLoadingPolygon,
    setAnalyseInformation,
    setAnalyseImageUrl,
    setAnalyseImageFileId,
    setAnalyseLoadingPolygon,
  } = useAnnotatorComponentStore();
  const clearScreenAnnotations = annotatorStore.useAnnotatorStore(params => params.clearScreenAnnotations);
  const promoteAnalyseRoofToAnnotator = annotatorStore.useAnnotatorStore(params => params.promoteAnalyseRoofToAnnotator);
  const roof2dPolygon = annotatorStore.useAnnotatorStore(
    useShallow(
      ({ annotations }) => Object.values(annotations).find(a => getAnnotationScreen(a) === 'annotator' && a.annotationInfos?.labelType === 'roof')?.polygon
    )
  );
  const { polygonList: analysePolygonList } = annotatorStore.useAnalysePolygonStore();
  const analyseInfos = annotatorStore.useAnalyseAnnotatorInfoStore();

  const analyseRoofInfos = analyseInfos.filter(info => info?.labelType === 'roof');
  const analyseRoofPolygon = analyseRoofInfos.length === 1 ? analysePolygonList.find(polygon => polygon.id === analyseRoofInfos[0].polygonId) : undefined;
  const roofForAnalyse = roof2dPolygon ?? analyseRoofPolygon;
  const roofPolygons = roofForAnalyse ? [roofForAnalyse] : [];

  const handleSuccess = () => {
    clearScreenAnnotations('roof-analyse');
    clearPolygons(false);
  };

  const { mutate: processDetection } = useRoofAnalyseQuery(roofPolygons, areaPictureDetails, handleSuccess);

  const isThereARoofPolygon = !!roofForAnalyse;
  const isPrecisionLevelInCmCorrect = areaPictureDetails?.actualLayer?.precisionLevelInCm === 5;
  const isAlreadyAnalysed = !!analyseImageUrl || isAfterAnalyse(analysePolygonList);
  const is2DRoof = !!roof2dPolygon;
  const isAnalysing = !!analyseLoadingPolygon;

  const isRunningRef = useRef(false);
  const didAutoRun = useRef(false);

  const runAnalyse = async () => {
    if (!(await requireCredits())) return;
    if (isRunningRef.current) return;
    isRunningRef.current = true;
    didAutoRun.current = true;
    const apiBalance = queryClient.getQueryData<CreditBalance>(CREDIT_BALANCE_QUERY_KEY);
    const baseBalance = getEffectiveCreditBalance(apiBalance, useOptimisticCreditBalanceStore.getState().balance);
    const optimisticBalance = baseBalance ? computeOptimisticBalance(baseBalance, baseBalance.creditCostPerAnalysis ?? 1) : undefined;
    setOptimisticBalance(optimisticBalance);
    prepareCreditPopup(optimisticBalance?.spendableCredits);
    const loadingPolygon = shiftPolygons(roofPolygons, areaPictureDetails, true)?.[0]?.points?.slice() ?? [];
    promoteAnalyseRoofToAnnotator();
    removeCache.roofDelimitation();
    clearScreenAnnotations('roof-analyse');
    setAnalyseInformation({ geoJsonResultUrl: '', imageUrl: '' });
    setAnalyseImageUrl(null);
    setAnalyseImageFileId(null);
    setAnalyseLoadingPolygon(loadingPolygon);
    processDetection(undefined, {
      onSettled: () => {
        isRunningRef.current = false;
      },
    });
  };

  useEffect(() => {
    if (didAutoRun.current) return;
    if (screen !== 'roof-analyse' || !is2DRoof || isAlreadyAnalysed || !isThereARoofPolygon || !isPrecisionLevelInCmCorrect || isAnalysing) return;
    didAutoRun.current = true;
    runAnalyse();
  }, [screen, is2DRoof, isAlreadyAnalysed, isThereARoofPolygon, isPrecisionLevelInCmCorrect, isAnalysing]);

  return { runAnalyse, isAnalysing, isAlreadyAnalysed, isThereARoofPolygon, isPrecisionLevelInCmCorrect };
};
