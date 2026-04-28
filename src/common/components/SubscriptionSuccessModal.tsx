import { FC } from 'react';
import { UrlParams } from '@bpartners/annotator-component';
import { DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { useDialog } from '../store/dialog';
import { Reload } from '../utils';
import { BPButton } from './BPButton';

type SubscriptionSuccessModalProps = {
  title: string;
  description: string;
};

export const SubscriptionSuccessModal : FC<SubscriptionSuccessModalProps> = ({title, description}) => {
  const { close } = useDialog();

  const handleClose = () => {
    UrlParams.set('stripeStatus', '');
    UrlParams.set('stripePaymentStatus', '');
    Reload.force();
    close();
  };

  return (
    <>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>{description}</DialogContent>
      <DialogActions>
        <BPButton onClick={handleClose} label='Fermer' />
      </DialogActions>
    </>
  );
};
