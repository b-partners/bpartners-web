import { UrlParams } from '@bpartners/annotator-component';
import { DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { useDialog } from '../store/dialog';
import { Reload } from '../utils';
import { BPButton } from './BPButton';

export const SubscriptionSuccessModal = () => {
  const { close } = useDialog();

  const handleClose = () => {
    UrlParams.set('stripeStatus', '');
    Reload.force();
    close();
  };

  return (
    <>
      <DialogTitle>Inscription terminée</DialogTitle>
      <DialogContent>Votre abonnement a été effectué avec succès, et votre inscription est dorénavant terminée.</DialogContent>
      <DialogActions>
        <BPButton onClick={handleClose} label='Fermer' />
      </DialogActions>
    </>
  );
};
