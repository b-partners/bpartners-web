import { useAnnotatorScreenSwitch } from '@/common/store';
import { Cached } from '@mui/icons-material';
import { Button } from '@mui/material';
import { FC } from 'react';
import { llmButtonStyle } from './style';

interface Props {
  enabled: boolean;
  onClick?: () => void;
}

export const LlmSwitchButton: FC<Props> = ({ enabled, onClick }) => {
  const { setScreen, screen } = useAnnotatorScreenSwitch();

  const handleClick = () => {
    onClick?.();
    setScreen(screen == 'llm' ? 'annotator' : 'llm');
  };

  if (!enabled || screen === '3d-annotator') return null;

  return (
    <Button sx={llmButtonStyle} startIcon={<Cached />} onClick={handleClick}>
      {screen == 'llm' && "Revenir à l’écran d'annotation"}
      {screen === 'annotator' && 'Générer un rapport'}
    </Button>
  );
};
