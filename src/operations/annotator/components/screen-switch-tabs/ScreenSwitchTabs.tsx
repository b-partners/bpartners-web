import { annotatorStore, useAnnotatorComponentStore, useAnnotatorScreenSwitch } from '@/common/store';
import { AutoAwesome, CropSquare, Roofing, ViewInAr } from '@mui/icons-material';
import { Box, ButtonBase } from '@mui/material';
import { ScreenSwitchTabsStyle } from './style';

export const ScreenSwitchTabs = () => {
  const { screen, setScreen } = useAnnotatorScreenSwitch();
  const { polygonList } = annotatorStore.usePolygonStore();
  const { roofDelimiter } = useAnnotatorComponentStore();
  const roofPolygon = annotatorStore.useAnnotatorStore(params => Object.values(params.annotations).find(a => a.isFirst));
  const { wearLevel, humidityLevel, moldRate } = roofPolygon?.annotationInfos || {};

  return (
    <Box sx={ScreenSwitchTabsStyle}>
      <ButtonBase type='button' className='screen-tab'>
        <Roofing />
        Analyse
      </ButtonBase>
      <ButtonBase type='button' onClick={() => setScreen('annotator')} className={`screen-tab ${screen === 'annotator' ? 'active' : ''}`}>
        <CropSquare />
        2D
      </ButtonBase>
      <ButtonBase
        disabled={!roofDelimiter?.polygon && polygonList.length === 0}
        type='button'
        onClick={() => setScreen('3d-annotator')}
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
