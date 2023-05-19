import { Button, Dialog, DialogTitle, DialogActions, DialogContent, DialogContentText } from '@mui/material';
import { useEffect } from 'react';

export const DialogSuccessSignUp = props => {
  const { isOpen, onClose } = props;

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (isOpen) {
        onClose();
      }
      return () => {
        clearTimeout(timeoutId);
      };
    }, 5000);
  });

  return (
    <>
      <Dialog open={isOpen} onClose={onClose}>
        <DialogTitle>Confirmation</DialogTitle>
        <DialogContent>
          <DialogContentText id='alert-dialog-description'>Pour finaliser votre inscription, un mail vous a été envoyé.</DialogContentText>
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
