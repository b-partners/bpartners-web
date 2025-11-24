import { useAnnotatorScreenSwitch } from '@/common/store';
import { Cached } from '@mui/icons-material';
import { Button } from '@mui/material';

export const Annotator3DSwitchButton = () => {
  const { screen, setScreen } = useAnnotatorScreenSwitch();
  const handleClick = () => setScreen(screen === '3d-annotator' ? 'annotator' : '3d-annotator');

  return (
    <Button sx={{ minWidth: 300 }} onClick={handleClick} startIcon={<Cached />}>
      {screen === '3d-annotator' && "Revenir à l’écran d'annotation"}
      {screen !== '3d-annotator' && 'Passer sur la version 3D'}
    </Button>
  );
};
