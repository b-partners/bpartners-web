import { useEffect } from 'react';
import { Button, Dialog, DialogTitle, DialogActions, DialogContent, DialogContentText } from '@mui/material';

export const DialogResetCodeSent = props => {
  const { isOpen, handleDialog } = props;

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
      <Dialog open={isOpen} onClose={() => handleDialog(false)}>
        <DialogTitle>Code envoyé</DialogTitle>
        <DialogContent>
          <DialogContentText id='alert-dialog-description'>Vous pouvez Vérifier votre boîte mail, votre code de validation a été envoyé</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button data-testid='close-modal-id' onClick={() => handleDialog(false)}>
            Fermer
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
