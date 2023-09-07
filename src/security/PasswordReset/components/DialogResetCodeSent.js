import { useEffect } from 'react';
import { Button, Dialog, DialogTitle, DialogActions, DialogContent, DialogContentText } from '@mui/material';

export const DialogResetCodeSent = props => {
  const { isOpen, onClose } = props;

  useEffect(() => {
    // const timeoutId = setTimeout(() => {
    //   if (isOpen) {
    //     onClose();
    //   }
    //   return () => {
    //     clearTimeout(timeoutId);
    //   };
    // }, 7000);
  });

  return (
    <>
      <Dialog open={isOpen} onClose={onClose}>
        <DialogTitle>Code envoyé</DialogTitle>
        <DialogContent>
          <DialogContentText id='alert-dialog-description'>Vérifier votre boîte mail, votre code de validation a été envoyé</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button data-testid='close-modal-id' onClick={onClose}>
            Fermer
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
