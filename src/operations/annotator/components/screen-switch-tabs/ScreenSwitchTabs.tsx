import { useRoofAnalyseQuery } from '@/common/fetcher';
import { annotatorStore, useAnnotatorComponentStore, useAnnotatorScreenSwitch } from '@/common/store';
import { useDialog } from '@/common/store/dialog';
import { clearPolygons } from '@/providers';
import { UrlParams } from '@bpartners/annotator-component';
import { AreaPictureDetails } from '@bpartners/typescript-client';
import { AutoAwesome, CropSquare, Roofing, ViewInAr } from '@mui/icons-material';
import { Box, ButtonBase } from '@mui/material';
import { FC } from 'react';
import { useNotify } from 'react-admin';
import { useShallow } from 'zustand/react/shallow';
import { isAfterAnalyse, shiftPolygons } from '../../utils';
import { RoofAnalysisDialog } from '../loading';
import { ScreenSwitchTabsStyle } from './style';

interface ScreenSwitchTabsProps {
  areaPicture: AreaPictureDetails;
}

export const ScreenSwitchTabs: FC<ScreenSwitchTabsProps> = ({ areaPicture }) => {
  const { screen, setScreen } = useAnnotatorScreenSwitch();
  const { polygonList } = annotatorStore.usePolygonStore();
  const { roofDelimiter } = useAnnotatorComponentStore();
  const annotation = annotatorStore.useAnnotatorStore(params => Object.values(params.annotations));
  const roofPolygon = annotatorStore.useAnnotatorStore(params => Object.values(params.annotations).find(a => a.isFirst));
  const resetAnnotations = annotatorStore.useAnnotatorStore(params => params.resetAnnotations);
  const { open: openDialog } = useDialog();
  const visibleMeasurementPolygonId = annotatorStore.useAnnotatorStore(useShallow(({ polygonToShowMeasurement }) => polygonToShowMeasurement));
  const handleDetectionProcessingSuccess = () => {
    resetAnnotations();
    clearPolygons(false);
  };

  const polygonListShifted = isAfterAnalyse(polygonList)
    ? polygonList
    : shiftPolygons(polygonList, areaPicture, true).map(p => ({
        ...p,
        measurements: p.id !== visibleMeasurementPolygonId ? [] : (p.measurements || []).map(m => ({ ...m, isInvisible: false })),
      }));
  const { mutate: _processDetection } = useRoofAnalyseQuery(polygonList || [], areaPicture, handleDetectionProcessingSuccess);
  const { wearLevel, humidityLevel, moldRate } = roofPolygon?.annotationInfos || {};

  const isPrecisionLevelInCmCorrect = areaPicture?.actualLayer?.precisionLevelInCm === 5;
  const isThereARoofPolygon = annotation.length === 1 && annotation[0].annotationInfos.labelType === 'roof';

  const { threeDFromSegmentation, annotations } = annotatorStore.useAnnotatorStore(
    useShallow(({ threeDFromSegmentation, annotations }) => ({ threeDFromSegmentation, annotations }))
  );

  const processDetection = () => {
    openDialog(
      <RoofAnalysisDialog imageHeight={1024 * 3} imageWidth={1024 * 3} imageUrl={UrlParams.get('imgUrl')} polygon={polygonListShifted?.[0]?.points?.slice()} />,
      { maxWidth: 'lg' },
      false
    );
    _processDetection();
  };

  const hasRoof = Object.values(annotations).find(a => a.annotationInfos.labelType === 'roof');
  const hasPan = Object.values(annotations).find(a => a.annotationInfos.labelType === 'pan');
  const notify = useNotify();

  const select3DGenerationMode = () => {
    if (screen === '3d-annotator') return setScreen('annotator');

    if (!isAfterAnalyse(polygonList) && threeDFromSegmentation && hasPan) setScreen('3d-annotator', 'pan');
    if (!isAfterAnalyse(polygonList) && threeDFromSegmentation && !hasPan)
      notify('Veuillez ajouter au moins un pan pour lancer la modélisation 3D par segmentation.', { type: 'warning' });

    if (!threeDFromSegmentation && hasRoof) setScreen('3d-annotator');
    if (!threeDFromSegmentation && !hasRoof) notify('Veuillez délimiter le toit pour lancer la modélisation 3D par emprise.', { type: 'warning' });
  };

  return (
    <Box sx={ScreenSwitchTabsStyle}>
      <ButtonBase type='button' onClick={() => setScreen('annotator')} className={`screen-tab ${screen === 'annotator' ? 'active' : ''}`}>
        <CropSquare />
        2D
      </ButtonBase>
      <ButtonBase onClick={processDetection} disabled={!isPrecisionLevelInCmCorrect || !isThereARoofPolygon} type='button' className='screen-tab'>
        <Roofing />
        Analyse
      </ButtonBase>
      <ButtonBase
        disabled={!roofDelimiter?.polygon && polygonList.length === 0}
        type='button'
        onClick={select3DGenerationMode}
        className={`screen-tab ${screen === '3d-annotator' ? 'active' : ''}`}
      >
        <ViewInAr />
        3D
      </ButtonBase>
      <ButtonBase
        disabled={!wearLevel && !humidityLevel && !moldRate}
        type='button'
        onClick={() => setScreen('llm')}
        className={`screen-tab ${screen === 'llm' ? 'active' : ''}`}
      >
        <AutoAwesome />
        Rapport
      </ButtonBase>
    </Box>
  );
};
