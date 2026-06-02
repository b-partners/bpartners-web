import { useRoofAnalyseQuery } from '@/common/fetcher';
import { annotatorStore, useAnnotatorComponentStore } from '@/common/store';
import { useDialog } from '@/common/store/dialog';
import { clearPolygons } from '@/providers';
import { UrlParams } from '@bpartners/annotator-component';
import { Roofing } from '@mui/icons-material';
import { Button } from '@mui/material';
import { useNotify } from 'react-admin';
import { useShallow } from 'zustand/react/shallow';
import { isAfterAnalyse, shiftPolygons } from '../../utils';
import { RoofAnalysisDialog } from '../loading';
import { RoofAnalyseRunButtonStyle } from './style';

export const RoofAnalyseRunButton = () => {
  const notify = useNotify();
  const { open: openDialog } = useDialog();
  const { areaPictureDetails, analyseImageUrl } = useAnnotatorComponentStore();
  const { polygonList: analysePolygonList } = annotatorStore.useScreenPolygonStore();
  const analyseInfos = annotatorStore.useScreenAnnotatorInfoStore();
  const visibleMeasurementPolygonId = annotatorStore.useAnnotatorStore(useShallow(({ polygonToShowMeasurement }) => polygonToShowMeasurement));
  const clearScreenAnnotations = annotatorStore.useAnnotatorStore(params => params.clearScreenAnnotations);

  const handleDetectionProcessingSuccess = () => {
    clearScreenAnnotations('roof-analyse');
    clearPolygons(false);
  };

  const roofInfos = analyseInfos.filter(info => info?.labelType === 'roof');
  const analyseRoofPolygon = roofInfos.length === 1 ? analysePolygonList.find(polygon => polygon.id === roofInfos[0].polygonId) : undefined;
  const roofPolygons = analyseRoofPolygon ? [analyseRoofPolygon] : [];

  const polygonListShifted = isAfterAnalyse(roofPolygons)
    ? roofPolygons
    : shiftPolygons(roofPolygons, areaPictureDetails, true).map(p => ({
        ...p,
        measurements: p.id !== visibleMeasurementPolygonId ? [] : (p.measurements || []).map(m => ({ ...m, isInvisible: false })),
      }));

  const { mutate: processDetection } = useRoofAnalyseQuery(roofPolygons, areaPictureDetails, handleDetectionProcessingSuccess);

  const isThereARoofPolygon = !!analyseRoofPolygon;
  const isPrecisionLevelInCmCorrect = areaPictureDetails?.actualLayer?.precisionLevelInCm === 5;
  const isAlreadyAnalysed = !!analyseImageUrl || isAfterAnalyse(analysePolygonList);

  const launchAnalyse = () => {
    openDialog(
      <RoofAnalysisDialog imageHeight={1024 * 3} imageWidth={1024 * 3} imageUrl={UrlParams.get('imgUrl')} polygon={polygonListShifted?.[0]?.points?.slice()} />,
      { maxWidth: 'lg' },
      false
    );
    processDetection();
  };

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
