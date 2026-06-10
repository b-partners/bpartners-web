import { annotatorStore, roof3DStore, useAnnotator3DStore, useAnnotatorScreenSwitch } from '@/common/store';
import { cache, removeCache } from '@/providers';
import { CheckCircle, Dashboard, Refresh, Roofing } from '@mui/icons-material';
import { Box, Button, ButtonBase, ButtonProps, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Typography } from '@mui/material';
import { FC, useState } from 'react';
import { v4 as uuid } from 'uuid';
import { regenerate3DModeSelectStyle } from './style';

export const Annotator3DRegenerateButton: FC<ButtonProps> = props => {
  const { screen, setScreen, threeDMode } = useAnnotatorScreenSwitch();
  const [open, setOpen] = useState(false);
  const [fromSegmentation, setFromSegmentation] = useState(annotatorStore.useAnnotatorStore.getState().threeDFromSegmentation ?? false);

  if (screen !== '3d-annotator') return null;

  const handleOpen = () => {
    setFromSegmentation(annotatorStore.useAnnotatorStore.getState().threeDFromSegmentation ?? false);
    setOpen(true);
  };

  const handleConfirm = () => {
    annotatorStore.useAnnotatorStore.getState().setThreeDFromSegmentation(fromSegmentation);
    annotatorStore.useAnnotatorStore.getState().setThreeDGenerationId(undefined);
    removeCache.cityJSONRequestId();
    cache.cityJSONRequestId(uuid());
    roof3DStore.useRoof3DStore.getState().reset();
    useAnnotator3DStore.getState().reset();
    useAnnotator3DStore.getState().incrementRegenerateVersion();
    setScreen('annotator');
    setTimeout(() => setScreen('3d-annotator', threeDMode), 100);
    setOpen(false);
  };

  return (
    <>
      <Button sx={{ minWidth: 300 }} onClick={handleOpen} startIcon={<Refresh />} {...props}>
        Régénérer la 3D
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Régénérer la modélisation 3D</DialogTitle>
        <DialogContent>
          <DialogContentText>Toutes les informations de la modélisation 3D précédente seront supprimées. Voulez-vous continuer ?</DialogContentText>
          <Box sx={regenerate3DModeSelectStyle}>
            <ButtonBase type='button' onClick={() => setFromSegmentation(false)} className={`regen-mode-block ${!fromSegmentation ? 'active' : ''}`}>
              <Box className='regen-mode-check'>
                <CheckCircle />
              </Box>
              <Box className='regen-mode-icon'>
                <Roofing />
              </Box>
              <Typography className='regen-mode-block-label'>Toit</Typography>
              <Typography className='regen-mode-block-desc'>Modélisation à partir du contour du toit</Typography>
            </ButtonBase>
            <ButtonBase type='button' onClick={() => setFromSegmentation(true)} className={`regen-mode-block ${fromSegmentation ? 'active' : ''}`}>
              <Box className='regen-mode-check'>
                <CheckCircle />
              </Box>
              <Box className='regen-mode-icon'>
                <Dashboard />
              </Box>
              <Typography className='regen-mode-block-label'>Pans</Typography>
              <Typography className='regen-mode-block-desc'>Modélisation à partir des pans segmentés</Typography>
            </ButtonBase>
          </Box>
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
