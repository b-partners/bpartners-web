import { Button, Dialog, DialogTitle, DialogActions, DialogContent, DialogContentText } from '@mui/material';

export const DialogResetCodeSent = props => {
  const { isOpen, handleDialog } = props;

  return (
    <>
      <Dialog open={isOpen} onClose={() => handleDialog(false)}>
        <DialogTitle>Code envoyé</DialogTitle>
        <DialogContent>
          <DialogContentText id='alert-dialog-description'>Vous pouvez vérifier votre boîte mail, votre code de validation a été envoyé</DialogContentText>
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
