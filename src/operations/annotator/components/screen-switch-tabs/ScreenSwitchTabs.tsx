import { annotatorStore, useAnnotator3DStore, useAnnotatorComponentStore, useAnnotatorLoadingStore, useAnnotatorScreenSwitch } from '@/common/store';
import { AutoAwesome, CropSquare, Roofing, ViewInAr } from '@mui/icons-material';
import { Box, ButtonBase, CircularProgress } from '@mui/material';
import { FC } from 'react';
import { useNotify } from 'react-admin';
import { useShallow } from 'zustand/react/shallow';
import { hasTwoDStateChangedSince, isAnalyseRoofAnnotation, ThreeDGenerationMode } from '../../utils';
import { ScreenSwitchTabsStyle } from './style';

interface ScreenSwitchTabsProps {
  onBeforeSwitch?: () => void;
}

export const ScreenSwitchTabs: FC<ScreenSwitchTabsProps> = ({ onBeforeSwitch }) => {
  const { screen, setScreen: setScreenRaw } = useAnnotatorScreenSwitch();
  const setScreen: typeof setScreenRaw = (...args) => {
    onBeforeSwitch?.();
    setScreenRaw(...args);
  };
  const { polygonList } = annotatorStore.usePolygonStore();
  const { roofDelimiter, areaPictureDetails } = useAnnotatorComponentStore();
  const setShouldPromptRegenerate = useAnnotator3DStore(params => params.setShouldPromptRegenerate);
  const roofPolygon = annotatorStore.useAnnotatorStore(useShallow(params => Object.values(params.annotations).find(isAnalyseRoofAnnotation)));
  const { wearLevel, humidityLevel, moldRate } = roofPolygon?.annotationInfos || {};

  const { threeDFromSegmentation, annotations } = annotatorStore.useAnnotatorStore(
    useShallow(({ threeDFromSegmentation, annotations }) => ({ threeDFromSegmentation, annotations }))
  );

  const hasRoof = Object.values(annotations).find(a => a.annotationInfos.labelType === 'roof');
  const hasPan = Object.values(annotations).find(a => a.annotationInfos.labelType === 'pan');
  const { is3DLoading, isAnalyseLoading } = useAnnotatorLoadingStore();
  const notify = useNotify();

  const select3DGenerationMode = () => {
    if (screen === '3d-annotator') return setScreen('annotator');

    const cameFrom2D = screen === 'annotator';
    const goTo3D = (mode: ThreeDGenerationMode) => {
      if (cameFrom2D && hasTwoDStateChangedSince(areaPictureDetails?.fileId, mode)) setShouldPromptRegenerate(true);
      return setScreen('3d-annotator', mode === 'pan' ? 'pan' : 'roof');
    };

    if (threeDFromSegmentation) {
      if (hasPan) return goTo3D('pan');
      return notify('Veuillez ajouter au moins un pan pour lancer la modélisation 3D par segmentation.', { type: 'warning' });
    }

    if (hasRoof) return goTo3D('roof');
    notify('Veuillez délimiter le toit pour lancer la modélisation 3D par emprise.', { type: 'warning' });
  };

  return (
    <Box sx={ScreenSwitchTabsStyle}>
      <ButtonBase type='button' onClick={() => setScreen('annotator')} className={`screen-tab ${screen === 'annotator' ? 'active' : ''}`}>
        <CropSquare />
        2D
      </ButtonBase>
      <ButtonBase
        disabled={!roofDelimiter?.polygon && polygonList.length === 0}
        type='button'
        onClick={select3DGenerationMode}
        className={`screen-tab ${screen === '3d-annotator' ? 'active' : ''}`}
      >
        <ViewInAr />
        3D
        {is3DLoading && <CircularProgress className='tab-loading' size={10} thickness={6} />}
      </ButtonBase>
      <ButtonBase type='button' onClick={() => setScreen('roof-analyse')} className={`screen-tab ${screen === 'roof-analyse' ? 'active' : ''}`}>
        <Roofing />
        Analyse
        {isAnalyseLoading && <CircularProgress className='tab-loading' size={10} thickness={6} />}
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
