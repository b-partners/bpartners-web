import { BPButton } from '@/common/components/BPButton';
import { useToggle } from '@/common/hooks';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Typography } from '@mui/material';
import { FC } from 'react';
import { useTranslate } from 'react-admin';
import { RefocusDialogProps } from './types';

export const RefocusDialog: FC<RefocusDialogProps> = ({ onAccept, isLoading, disabled }) => {
  const { value: isOpen, handleClose, handleOpen } = useToggle();
  const translate = useTranslate();

  const handleAccept = () => {
    onAccept();
    handleClose();
  };

  return (
    <>
      <BPButton
        type='button'
        onClick={handleOpen}
        data-testid='center-img-btn'
        label={`bp.action.${!disabled ? 'refocusImage' : 'resetRefocusImage'}`}
        isLoading={isLoading}
      />
      <Dialog open={isOpen} onClose={handleClose} aria-labelledby='alert-dialog-title' aria-describedby='alert-dialog-description'>
        <DialogTitle id='alert-dialog-title'>Recentrer l'image</DialogTitle>
        <DialogContent>
          <DialogContentText id='alert-dialog-description'>
            {translate(`resources.annotation.text.${!disabled ? 'refocusImage' : 'resetRefocusImage'}`)}
          </DialogContentText>
          <Typography aria-atomic color='error'>
            Attention! Toutes les annotations seront tous supprimé.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Annuler</Button>
          <BPButton style={{ width: 100 }} onClick={handleAccept} autoFocus label='bp.action.confirm' />
        </DialogActions>
      </Dialog>
    </>
  );
};
