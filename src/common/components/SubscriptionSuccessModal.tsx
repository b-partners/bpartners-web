import { DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { useDialog } from '../store/dialog';
import { BPButton } from './BPButton';

export const SubscriptionSuccessModal = () => {
  const { close } = useDialog();
  return (
    <>
      <DialogTitle>Inscription terminée</DialogTitle>
      <DialogContent>Votre abonnement a été effectué avec succès, et votre inscription est dorénavant terminée.</DialogContent>
      <DialogActions>
        <BPButton onClick={close} label='Fermer' />
      </DialogActions>
    </>
  );
};
