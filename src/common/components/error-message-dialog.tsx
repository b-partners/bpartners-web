import { Button, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { FC } from 'react';
import { useDialog } from '../store/dialog';

interface ErrorMessageDialogProps {
  message: string;
  onClose?: () => void;
}

export const ErrorMessageDialog: FC<ErrorMessageDialogProps> = ({ message, onClose }) => {
  const { close: closeDialog } = useDialog();
  const handleClose = () => {
    closeDialog();
    onClose?.();
  };

  return (
    <>
      <DialogTitle>Erreur</DialogTitle>
      <DialogContent>{message}</DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Fermer</Button>
      </DialogActions>
    </>
  );
};
