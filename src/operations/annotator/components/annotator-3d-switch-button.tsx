import { useAnnotatorScreenSwitch } from '@/common/store';
import { Cached } from '@mui/icons-material';
import { Button, ButtonProps } from '@mui/material';
import { FC } from 'react';

export const Annotator3DSwitchButton: FC<ButtonProps> = (props) => {
  const { screen, setScreen } = useAnnotatorScreenSwitch();
  const handleClick = () => setScreen(screen === '3d-annotator' ? 'annotator' : '3d-annotator');

  return (
    <Button sx={{ minWidth: 300 }} onClick={handleClick} startIcon={<Cached />} {...props}>
      {screen === '3d-annotator' && "Revenir à l’écran d'annotation"}
      {screen !== '3d-annotator' && 'Passer sur la version 3D'}
    </Button>
  );
};
