import { annotatorStore, useAnnotatorScreenSwitch } from '@/common/store';
import { Cached } from '@mui/icons-material';
import { Button } from '@mui/material';
import { FC } from 'react';
import { llmButtonStyle } from './style';

interface Props {
  onClick?: () => void;
}

export const LlmSwitchButton: FC<Props> = ({ onClick }) => {
  const { setScreen, screen } = useAnnotatorScreenSwitch();
  const roofPolygon = annotatorStore.useAnnotatorStore(params => Object.values(params.annotations).find(a => a.isFirst));

  const handleClick = () => {
    onClick?.();
    setScreen(screen == 'llm' ? 'annotator' : 'llm');
  };

  const { wearLevel, humidityLevel, moldRate } = roofPolygon?.annotationInfos || {};

  if (screen === '3d-annotator') return null;

  return (
    <Button sx={llmButtonStyle} startIcon={<Cached />} disabled={!wearLevel && !humidityLevel && !moldRate} onClick={handleClick}>
      {screen == 'llm' && "Revenir à l’écran d'annotation"}
      {screen === 'annotator' && 'Générer un rapport'}
    </Button>
  );
};
