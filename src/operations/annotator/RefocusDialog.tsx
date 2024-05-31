import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Typography } from '@mui/material';
import { FC, useState } from 'react';
import { BPButton } from 'src/common/components/BPButton';
import { REFOCUS_BUTTON } from './style';
import { RefocusDialogProps } from './types';

export const RefocusDialog: FC<RefocusDialogProps> = ({ onAccept, isLoading, disabled }) => {
  const [isOpen, setOpen] = useState(false);

  const handleClose = () => setOpen(false);
  const handleOpen = () => setOpen(true);

  const handleAccept = () => {
    onAccept();
    handleClose();
  };

  return (
    <>
      <BPButton type='button' disabled={disabled} onClick={handleOpen} data-testid='center-img-btn' label="Recenter l'image" style={REFOCUS_BUTTON} />
      <Dialog open={isOpen} onClose={handleClose} aria-labelledby='alert-dialog-title' aria-describedby='alert-dialog-description'>
        <DialogTitle id='alert-dialog-title'>Recentrer l'image</DialogTitle>
        <DialogContent>
          <DialogContentText id='alert-dialog-description'>
            Cette action va agrandir la zone couverte par l'image.
            <Typography color='error'>Attention! Toutes les annotations seront tous supprimé.</Typography>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Annuler</Button>
          <BPButton style={{ width: 100 }} onClick={handleAccept} autoFocus label='Confirmer' isLoading={isLoading} />
        </DialogActions>
      </Dialog>
    </>
  );
};
