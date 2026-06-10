import { useRoofAnalyseQuery } from '@/common/fetcher';
import { annotatorStore, getAnnotationScreen, useAnnotatorComponentStore, useAnnotatorScreenSwitch } from '@/common/store';
import { clearPolygons, removeCache } from '@/providers';
import { useEffect, useRef } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { isAfterAnalyse } from './is-after-analyse';
import { shiftPolygons } from './shift-polygons';

export interface RoofAnalyseGeneration {
  runAnalyse: () => void;
  isAnalysing: boolean;
  isAlreadyAnalysed: boolean;
  isThereARoofPolygon: boolean;
  isPrecisionLevelInCmCorrect: boolean;
}

export const useRoofAnalyseGeneration = (): RoofAnalyseGeneration => {
  const { screen } = useAnnotatorScreenSwitch();
  const { areaPictureDetails, analyseImageUrl, analyseLoadingPolygon, setAnalyseInformation, setAnalyseImageUrl, setAnalyseImageFileId, setAnalyseLoadingPolygon } =
    useAnnotatorComponentStore();
  const clearScreenAnnotations = annotatorStore.useAnnotatorStore(params => params.clearScreenAnnotations);
  const roof2dPolygon = annotatorStore.useAnnotatorStore(
    useShallow(({ annotations }) => Object.values(annotations).find(a => getAnnotationScreen(a) === 'annotator' && a.annotationInfos?.labelType === 'roof')?.polygon)
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

  const runAnalyse = () => {
    const loadingPolygon = shiftPolygons(roofPolygons, areaPictureDetails, true)?.[0]?.points?.slice() ?? [];
    removeCache.roofDelimitation();
    clearScreenAnnotations('roof-analyse');
    setAnalyseInformation({ geoJsonResultUrl: '', imageUrl: '' });
    setAnalyseImageUrl(null);
    setAnalyseImageFileId(null);
    setAnalyseLoadingPolygon(loadingPolygon);
    processDetection();
  };

  const didAutoRun = useRef(false);
  useEffect(() => {
    if (didAutoRun.current) return;
    if (screen !== 'roof-analyse' || !is2DRoof || isAlreadyAnalysed || !isThereARoofPolygon || !isPrecisionLevelInCmCorrect || isAnalysing) return;
    didAutoRun.current = true;
    runAnalyse();
  }, [screen, is2DRoof, isAlreadyAnalysed, isThereARoofPolygon, isPrecisionLevelInCmCorrect, isAnalysing]);

  return { runAnalyse, isAnalysing, isAlreadyAnalysed, isThereARoofPolygon, isPrecisionLevelInCmCorrect };
};
