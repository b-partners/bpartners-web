import { annotatorStore, useAnnotatorScreenSwitch } from '@/common/store';
import { useDialog } from '@/common/store/dialog';
import { Cached } from '@mui/icons-material';
import { Button, ButtonProps } from '@mui/material';
import { FC } from 'react';
import { isAfterAnalyse } from '../utils';
import { ThreeDSelectDialog } from './3d-select-dialog';

export const Annotator3DSwitchButton: FC<ButtonProps> = props => {
  const { screen, setScreen } = useAnnotatorScreenSwitch();
  const { open: openDialog } = useDialog();
  const { polygonList } = annotatorStore.usePolygonStore();

  const select3DGenerationMode = () => {
    if (screen === '3d-annotator') setScreen('annotator');
    else if (!isAfterAnalyse(polygonList)) openDialog(<ThreeDSelectDialog />);
    else setScreen('3d-annotator');
  };
  return (
    <Button sx={{ minWidth: 300 }} onClick={select3DGenerationMode} startIcon={<Cached />} {...props}>
      {screen === '3d-annotator' && "Revenir à l’écran d'annotation"}
      {screen !== '3d-annotator' && 'Passer sur la version 3D'}
    </Button>
  );
};
