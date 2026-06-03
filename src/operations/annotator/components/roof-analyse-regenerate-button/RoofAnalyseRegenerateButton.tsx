import { useRoofAnalyseQuery } from '@/common/fetcher';
import { annotatorStore, getAnnotationScreen, useAnnotatorComponentStore, useAnnotatorScreenSwitch } from '@/common/store';
import { clearPolygons, removeCache } from '@/providers';
import { Refresh } from '@mui/icons-material';
import { Button, ButtonProps, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Tooltip } from '@mui/material';
import { FC, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { shiftPolygons } from '../../utils';
import { RoofAnalyseRegenerateButtonStyle } from './style';

export const RoofAnalyseRegenerateButton: FC<ButtonProps> = props => {
  const { screen } = useAnnotatorScreenSwitch();
  const [open, setOpen] = useState(false);
  const { areaPictureDetails, setAnalyseInformation, setAnalyseImageUrl, setAnalyseImageFileId, setAnalyseLoadingPolygon } = useAnnotatorComponentStore();
  const clearScreenAnnotations = annotatorStore.useAnnotatorStore(params => params.clearScreenAnnotations);
  const roof2dPolygon = annotatorStore.useAnnotatorStore(
    useShallow(
      ({ annotations }) => Object.values(annotations).find(a => getAnnotationScreen(a) === 'annotator' && a.annotationInfos?.labelType === 'roof')?.polygon
    )
  );

  const roofPolygons = roof2dPolygon ? [roof2dPolygon] : [];

  const handleSuccess = () => {
    clearScreenAnnotations('roof-analyse');
    clearPolygons(false);
  };

  const { mutate: processDetection } = useRoofAnalyseQuery(roofPolygons, areaPictureDetails, handleSuccess);

  if (screen !== 'roof-analyse') return null;

  const isThereARoofPolygon = !!roof2dPolygon;
  const isPrecisionLevelInCmCorrect = areaPictureDetails?.actualLayer?.precisionLevelInCm === 5;

  const handleConfirm = () => {
    const loadingPolygon = shiftPolygons(roofPolygons, areaPictureDetails, true)?.[0]?.points?.slice() ?? [];
    removeCache.roofDelimitation();
    clearScreenAnnotations('roof-analyse');
    setAnalyseInformation({ geoJsonResultUrl: '', imageUrl: '' });
    setAnalyseImageUrl(null);
    setAnalyseImageFileId(null);
    setAnalyseLoadingPolygon(loadingPolygon);
    processDetection();
    setOpen(false);
  };

  const button = (
    <Button
      sx={RoofAnalyseRegenerateButtonStyle}
      onClick={() => setOpen(true)}
      startIcon={<Refresh />}
      {...props}
      disabled={!isThereARoofPolygon || !isPrecisionLevelInCmCorrect}
    >
      Régénérer l’analyse
    </Button>
  );

  return (
    <>
      {isPrecisionLevelInCmCorrect ? (
        button
      ) : (
        <Tooltip title='L’image actuelle n’a pas une précision de 5 cm, donc l’analyse ne peut pas être lancée.'>
          <span>{button}</span>
        </Tooltip>
      )}
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Régénérer l’analyse de toiture</DialogTitle>
        <DialogContent>
          <DialogContentText>Toutes les informations de l’analyse précédente seront supprimées. Voulez-vous continuer ?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Annuler</Button>
          <Button onClick={handleConfirm} variant='contained' color='error'>
            Confirmer
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
