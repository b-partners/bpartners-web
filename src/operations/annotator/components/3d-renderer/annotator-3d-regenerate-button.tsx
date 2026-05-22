import { annotatorStore, roof3DStore, useAnnotator3DStore, useAnnotatorScreenSwitch } from '@/common/store';
import { removeCache } from '@/providers';
import { Refresh } from '@mui/icons-material';
import { Button, ButtonProps, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { FC, useState } from 'react';

export const Annotator3DRegenerateButton: FC<ButtonProps> = props => {
  const { screen, setScreen, threeDMode } = useAnnotatorScreenSwitch();
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  if (screen !== '3d-annotator') return null;

  const handleConfirm = () => {
    annotatorStore.useAnnotatorStore.getState().setThreeDGenerationId(undefined);
    removeCache.cityJSONRequestId();
    roof3DStore.useRoof3DStore.getState().reset();
    useAnnotator3DStore.getState().reset();
    useAnnotator3DStore.getState().incrementRegenerateVersion();
    queryClient.removeQueries();
    setScreen('annotator');
    setTimeout(() => setScreen('3d-annotator', threeDMode), 100);
    setOpen(false);
  };

  return (
    <>
      <Button sx={{ minWidth: 300 }} onClick={() => setOpen(true)} startIcon={<Refresh />} {...props}>
        Régénérer la 3D
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Régénérer la modélisation 3D</DialogTitle>
        <DialogContent>
          <DialogContentText>Toutes les informations de la modélisation 3D précédente seront supprimées. Voulez-vous continuer ?</DialogContentText>
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
