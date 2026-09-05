import { CITY_JSON_QUERY_KEY_PREFIX } from '@/common/fetcher';
import { annotatorStore, roof3DStore, useAnnotator3DStore, useAnnotatorScreenSwitch } from '@/common/store';
import { useCreditRequirement } from '@/operations/account/components/billing';
import { cache, removeCache } from '@/providers';
import { Dashboard, Refresh, Roofing } from '@mui/icons-material';
import { Box, Button, ButtonBase, ButtonProps, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Typography } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { FC, useEffect, useState } from 'react';
import { v4 as uuid } from 'uuid';
import { regenerate3DModeSelectStyle } from './style';

export const Annotator3DRegenerateButton: FC<ButtonProps> = props => {
  const { screen, setScreen } = useAnnotatorScreenSwitch();
  const { shouldPromptRegenerate, setShouldPromptRegenerate } = useAnnotator3DStore();
  const { requireCredits } = useCreditRequirement();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [fromSegmentation, setFromSegmentation] = useState(annotatorStore.useAnnotatorStore.getState().threeDFromSegmentation ?? false);

  const handleOpen = () => {
    setFromSegmentation(annotatorStore.useAnnotatorStore.getState().threeDFromSegmentation ?? false);
    setOpen(true);
  };

  useEffect(() => {
    if (screen === '3d-annotator' && shouldPromptRegenerate) {
      handleOpen();
      setShouldPromptRegenerate(false);
    }
  }, [screen, shouldPromptRegenerate, setShouldPromptRegenerate]);

  if (screen !== '3d-annotator') return null;

  const handleConfirm = async () => {
    setOpen(false);
    if (!(await requireCredits())) return;
    queryClient.cancelQueries({ queryKey: [CITY_JSON_QUERY_KEY_PREFIX] });
    annotatorStore.useAnnotatorStore.getState().setThreeDFromSegmentation(fromSegmentation);
    annotatorStore.useAnnotatorStore.getState().setThreeDGenerationId(undefined);
    removeCache.cityJSONRequestId();
    cache.cityJSONRequestId(uuid());
    roof3DStore.useRoof3DStore.getState().reset();
    useAnnotator3DStore.getState().reset();
    useAnnotator3DStore.getState().incrementRegenerateVersion();
    setScreen('annotator');
    setTimeout(() => setScreen('3d-annotator', fromSegmentation ? 'pan' : 'roof'), 100);
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
            <Typography component='span' className='regen-mode-caption'>
              Mode de délimitation
            </Typography>
            <ButtonBase type='button' onClick={() => setFromSegmentation(false)} className={`regen-mode-option ${!fromSegmentation ? 'active' : ''}`}>
              <Box className='regen-mode-icon'>
                <Roofing />
              </Box>
              <Box className='regen-mode-text'>
                <Typography className='regen-mode-label'>Toit</Typography>
                <Typography className='regen-mode-desc'>Modélisation à partir du contour du toit</Typography>
              </Box>
              <Box className='regen-mode-radio' />
            </ButtonBase>
            <ButtonBase type='button' onClick={() => setFromSegmentation(true)} className={`regen-mode-option ${fromSegmentation ? 'active' : ''}`}>
              <Box className='regen-mode-icon'>
                <Dashboard />
              </Box>
              <Box className='regen-mode-text'>
                <Typography className='regen-mode-label'>Pans</Typography>
                <Typography className='regen-mode-desc'>Modélisation à partir des pans segmentés</Typography>
              </Box>
              <Box className='regen-mode-radio' />
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
