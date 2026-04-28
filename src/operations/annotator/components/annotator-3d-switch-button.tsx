import { annotatorStore, useAnnotatorScreenSwitch } from '@/common/store';
import { roofGlobalIdRef } from '@/operations/prospects/constants';
import { Cached } from '@mui/icons-material';
import { Button, ButtonProps } from '@mui/material';
import { FC } from 'react';
import { useNotify } from 'react-admin';
import { useShallow } from 'zustand/react/shallow';
import { isAfterAnalyse } from '../utils';

export const Annotator3DSwitchButton: FC<ButtonProps> = props => {
  const { screen, setScreen } = useAnnotatorScreenSwitch();
  const { polygonList } = annotatorStore.usePolygonStore();
  const { threeDFromSegmentation, annotations } = annotatorStore.useAnnotatorStore(
    useShallow(({ threeDFromSegmentation, annotations }) => ({ threeDFromSegmentation, annotations }))
  );

  const hasRoof = polygonList.find(p => p.id.includes(roofGlobalIdRef));
  const hasPan = Object.values(annotations).find(a => a.annotationInfos.labelType === 'pan');
  const notify = useNotify();

  const select3DGenerationMode = () => {
    if (screen === '3d-annotator') return setScreen('annotator');

    if (!isAfterAnalyse(polygonList) && !threeDFromSegmentation && hasPan) setScreen('annotator', 'pan');
    if (!isAfterAnalyse(polygonList) && !threeDFromSegmentation && !hasPan)
      notify('Veuillez ajouter au moins un pan pour lancer la modélisation 3D par segmentation.', { type: 'warning' });

    if (threeDFromSegmentation && hasRoof) setScreen('3d-annotator');
    if (threeDFromSegmentation && !hasRoof) notify('Veuillez délimiter le toit pour lancer la modélisation 3D par emprise.', { type: 'warning' });
  };
  return (
    <Button sx={{ minWidth: 300 }} onClick={select3DGenerationMode} startIcon={<Cached />} {...props}>
      {screen === '3d-annotator' && "Revenir à l’écran d'annotation"}
      {screen !== '3d-annotator' && 'Passer sur la version 3D'}
    </Button>
  );
};
