import { useAnnotatorScreenSwitch } from '@/common/store';
import { Refresh, Roofing } from '@mui/icons-material';
import { Button, ButtonProps, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Tooltip } from '@mui/material';
import { FC, useState } from 'react';
import { RoofAnalyseGeneration } from '../../utils';
import { RoofAnalyseRegenerateButtonStyle } from './style';

interface RoofAnalyseRegenerateButtonProps extends ButtonProps {
  generation: RoofAnalyseGeneration;
}

export const RoofAnalyseRegenerateButton: FC<RoofAnalyseRegenerateButtonProps> = ({ generation, ...props }) => {
  const { screen } = useAnnotatorScreenSwitch();
  const [open, setOpen] = useState(false);
  const { runAnalyse, isAnalysing, isAlreadyAnalysed, isThereARoofPolygon, isPrecisionLevelInCmCorrect } = generation;

  if (screen !== 'roof-analyse') return null;

  const handleConfirm = () => {
    runAnalyse();
    setOpen(false);
  };

  const handleClick = () => (isAlreadyAnalysed ? setOpen(true) : runAnalyse());

  const button = (
    <Button
      sx={RoofAnalyseRegenerateButtonStyle}
      onClick={handleClick}
      startIcon={isAlreadyAnalysed ? <Refresh fontSize='small' /> : <Roofing fontSize='small' />}
      {...props}
      disabled={!isThereARoofPolygon || !isPrecisionLevelInCmCorrect || isAnalysing}
    >
      {isAlreadyAnalysed ? 'Relancer l’analyse' : 'Lancer l’analyse'}
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
        <DialogTitle>Relancer l’analyse de toiture</DialogTitle>
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
