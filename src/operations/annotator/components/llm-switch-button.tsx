import { NOOP_FN } from '@/common/utils/noop_fn';
import { Cached } from '@mui/icons-material';
import { Button } from '@mui/material';
import { FC } from 'react';
import { llmButtonStyle } from './style';

interface Props {
  enabled: boolean;
  onClick: typeof NOOP_FN;
  showLlmResult: boolean;
}

export const LlmSwitchButton: FC<Props> = ({ enabled, onClick, showLlmResult }) => {
  if (!enabled) return null;

  return (
    <Button sx={llmButtonStyle} startIcon={<Cached />} onClick={onClick}>
      {showLlmResult ? "Revenir à l’écran d'annotation" : 'Comprendre votre rapport'}
    </Button>
  );
};
