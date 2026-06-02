import { annotatorStore, useAnnotatorComponentStore, useAnnotatorScreenSwitch } from '@/common/store';
import { AutoAwesome, CropSquare, Roofing, ViewInAr } from '@mui/icons-material';
import { Box, ButtonBase } from '@mui/material';
import { useNotify } from 'react-admin';
import { useShallow } from 'zustand/react/shallow';
import { ScreenSwitchTabsStyle } from './style';

export const ScreenSwitchTabs = () => {
  const { screen, setScreen } = useAnnotatorScreenSwitch();
  const { polygonList } = annotatorStore.usePolygonStore();
  const { roofDelimiter } = useAnnotatorComponentStore();
  const roofPolygon = annotatorStore.useAnnotatorStore(params => Object.values(params.annotations).find(a => a.isFirst));
  const { wearLevel, humidityLevel, moldRate } = roofPolygon?.annotationInfos || {};

  const { threeDFromSegmentation, annotations } = annotatorStore.useAnnotatorStore(
    useShallow(({ threeDFromSegmentation, annotations }) => ({ threeDFromSegmentation, annotations }))
  );

  const hasRoof = Object.values(annotations).find(a => a.annotationInfos.labelType === 'roof');
  const hasPan = Object.values(annotations).find(a => a.annotationInfos.labelType === 'pan');
  const notify = useNotify();

  const select3DGenerationMode = () => {
    if (screen === '3d-annotator') return setScreen('annotator');

    if (threeDFromSegmentation) {
      if (hasPan) return setScreen('3d-annotator', 'pan');
      return notify('Veuillez ajouter au moins un pan pour lancer la modélisation 3D par segmentation.', { type: 'warning' });
    }

    if (hasRoof) return setScreen('3d-annotator');
    notify('Veuillez délimiter le toit pour lancer la modélisation 3D par emprise.', { type: 'warning' });
  };

  return (
    <Box sx={ScreenSwitchTabsStyle}>
      <ButtonBase type='button' onClick={() => setScreen('annotator')} className={`screen-tab ${screen === 'annotator' ? 'active' : ''}`}>
        <CropSquare />
        2D
      </ButtonBase>
      <ButtonBase type='button' onClick={() => setScreen('roof-analyse')} className={`screen-tab ${screen === 'roof-analyse' ? 'active' : ''}`}>
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
