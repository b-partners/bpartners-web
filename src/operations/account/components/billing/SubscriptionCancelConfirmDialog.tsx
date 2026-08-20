import { Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import { FC } from 'react';
import { BillingConfirmDialogStyle } from './style';

interface SubscriptionCancelConfirmDialogProps {
  open: boolean;
  endDate: string;
  isPending: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export const SubscriptionCancelConfirmDialog: FC<SubscriptionCancelConfirmDialogProps> = ({ open, endDate, isPending, onCancel, onConfirm }) => (
  <Dialog open={open} onClose={isPending ? undefined : onCancel} maxWidth='xs' fullWidth sx={BillingConfirmDialogStyle}>
    <DialogTitle className='confirm-title'>Résilier votre abonnement ?</DialogTitle>
    <DialogContent>
      <Box className='confirm-row'>
        <Typography className='confirm-row-label'>Renouvellement</Typography>
        <Typography className='confirm-row-value confirm-row-value--danger'>Arrêté</Typography>
      </Box>
      {!!endDate && (
        <Box className='confirm-row'>
          <Typography className='confirm-row-label'>Accès conservé jusqu’au</Typography>
          <Typography className='confirm-row-value'>{endDate}</Typography>
        </Box>
      )}
      <Typography className='confirm-note'>
        Votre abonnement ne sera pas renouvelé et aucun nouveau prélèvement ne sera effectué. Vos crédits achetés restent disponibles après la résiliation.
      </Typography>
    </DialogContent>
    <DialogActions className='confirm-actions'>
      <Button onClick={onCancel} disabled={isPending} name='keep-subscription' className='confirm-cancel'>
        Conserver mon abonnement
      </Button>
      <Button
        variant='contained'
        onClick={onConfirm}
        disabled={isPending}
        name='confirm-subscription-cancel'
        className='confirm-submit confirm-submit--danger'
        startIcon={isPending ? <CircularProgress size={14} color='inherit' /> : undefined}
      >
        Confirmer la résiliation
      </Button>
    </DialogActions>
  </Dialog>
);
