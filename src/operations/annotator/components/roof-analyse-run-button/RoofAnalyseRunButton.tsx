import { useRoofAnalyseQuery } from '@/common/fetcher';
import { annotatorStore, useAnnotatorComponentStore } from '@/common/store';
import { useDialog } from '@/common/store/dialog';
import { clearPolygons } from '@/providers';
import { UrlParams } from '@bpartners/annotator-component';
import { Roofing } from '@mui/icons-material';
import { Button } from '@mui/material';
import { useEffect, useRef } from 'react';
import { useNotify } from 'react-admin';
import { useShallow } from 'zustand/react/shallow';
import { isAfterAnalyse, shiftPolygons } from '../../utils';
import { RoofAnalysisDialog } from '../loading';
import { RoofAnalyseRunButtonStyle } from './style';

export const RoofAnalyseRunButton = () => {
  const notify = useNotify();
  const { open: openDialog } = useDialog();
  const { areaPictureDetails, analyseImageUrl } = useAnnotatorComponentStore();
  const { polygonList } = annotatorStore.usePolygonStore();
  const annotations = annotatorStore.useAnnotatorStore(useShallow(params => Object.values(params.annotations)));
  const visibleMeasurementPolygonId = annotatorStore.useAnnotatorStore(useShallow(({ polygonToShowMeasurement }) => polygonToShowMeasurement));
  const clearScreenAnnotations = annotatorStore.useAnnotatorStore(params => params.clearScreenAnnotations);

  const handleDetectionProcessingSuccess = () => {
    clearScreenAnnotations('roof-analyse');
    clearPolygons(false);
  };

  const polygonListShifted = isAfterAnalyse(polygonList)
    ? polygonList
    : shiftPolygons(polygonList, areaPictureDetails, true).map(p => ({
        ...p,
        measurements: p.id !== visibleMeasurementPolygonId ? [] : (p.measurements || []).map(m => ({ ...m, isInvisible: false })),
      }));

  const { mutate: processDetection } = useRoofAnalyseQuery(polygonList || [], areaPictureDetails, handleDetectionProcessingSuccess);

  const isThereARoofPolygon = annotations.filter(annotation => annotation.annotationInfos.labelType === 'roof').length === 1;
  const isPrecisionLevelInCmCorrect = areaPictureDetails?.actualLayer?.precisionLevelInCm === 5;
  const isAlreadyAnalysed = !!analyseImageUrl || isAfterAnalyse(polygonList);

  const launchAnalyse = () => {
    openDialog(
      <RoofAnalysisDialog imageHeight={1024 * 3} imageWidth={1024 * 3} imageUrl={UrlParams.get('imgUrl')} polygon={polygonListShifted?.[0]?.points?.slice()} />,
      { maxWidth: 'lg' },
      false
    );
    processDetection();
  };

  const didAutoRun = useRef(false);
  useEffect(() => {
    if (didAutoRun.current || isAlreadyAnalysed || !isThereARoofPolygon || !isPrecisionLevelInCmCorrect) return;
    didAutoRun.current = true;
    launchAnalyse();
  }, []);

  if (isAlreadyAnalysed) return null;

  const runAnalyse = () => {
    if (!isThereARoofPolygon) return notify('Veuillez délimiter un seul toit avant de lancer l’analyse.', { type: 'warning' });
    launchAnalyse();
  };

  return (
    <Button
      sx={RoofAnalyseRunButtonStyle}
      variant='contained'
      color='secondary'
      size='small'
      startIcon={<Roofing fontSize='small' />}
      disabled={!isThereARoofPolygon || !isPrecisionLevelInCmCorrect}
      onClick={runAnalyse}
    >
      Lancer l’analyse
    </Button>
  );
};
