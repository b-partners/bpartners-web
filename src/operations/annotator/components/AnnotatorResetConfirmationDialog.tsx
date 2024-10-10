import { BPButton } from '@/common/components';
import { useDialog } from '@/common/store/dialog';
import { BpFrenchMessages } from '@/common/utils';
import { DialogActions, DialogContent, DialogContentText, DialogTitle, Typography } from '@mui/material';
import { FC, useMemo } from 'react';
import { useTranslate } from 'react-admin';

interface AnnotatorResetStateConfirmationDialogProps {
  title: string;
  content: keyof typeof BpFrenchMessages.bp.confirmationMessages;
  onConfirm: () => void;
}

export const AnnotatorResetStateConfirmationDialog: FC<AnnotatorResetStateConfirmationDialogProps> = ({ title, onConfirm, content }) => {
  const { close } = useDialog();
  const translate = useTranslate();
  const description = useMemo(() => translate(`bp.confirmationMessages.${content}`), [content]);
  const handleConfirm = () => {
    onConfirm();
    close();
  };
  return (
    <>
      <DialogTitle id='alert-dialog-title'>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText id='alert-dialog-description'>{description}</DialogContentText>
        <Typography aria-atomic color='error'>
          Attention! Toutes les annotations seront tous supprimé.
        </Typography>
      </DialogContent>
      <DialogActions>
        <BPButton onClick={close} label='ra.action.cancel' />
        <BPButton onClick={handleConfirm} autoFocus label='bp.action.confirm' />
      </DialogActions>
    </>
  );
};
