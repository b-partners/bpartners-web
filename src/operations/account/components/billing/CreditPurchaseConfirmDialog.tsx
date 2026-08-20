import { CreditPack } from '@bpartners/typescript-client';
import { Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import { FC } from 'react';
import { BillingConfirmDialogStyle } from './style';
import { formatCredits, formatEuros, getPackTotalCents } from './utils';

export interface CreditPurchaseCandidate {
  purchaseId: string;
  pack: CreditPack;
  credits: number;
}

interface CreditPurchaseConfirmDialogProps {
  purchase?: CreditPurchaseCandidate;
  isPending: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export const CreditPurchaseConfirmDialog: FC<CreditPurchaseConfirmDialogProps> = ({ purchase, isPending, onCancel, onConfirm }) => (
  <Dialog open={!!purchase} onClose={isPending ? undefined : onCancel} maxWidth='xs' fullWidth sx={BillingConfirmDialogStyle}>
    <DialogTitle className='confirm-title'>Confirmer votre achat de crédits</DialogTitle>
    <DialogContent>
      {purchase && (
        <>
          <Box className='confirm-row'>
            <Typography className='confirm-row-label'>Crédits achetés</Typography>
            <Typography className='confirm-row-value'>{formatCredits(purchase.credits)}</Typography>
          </Box>
          <Box className='confirm-row'>
            <Typography className='confirm-row-label'>Montant à payer</Typography>
            <Typography className='confirm-row-value confirm-row-value--strong'>
              {formatEuros(getPackTotalCents(purchase.pack, purchase.credits, 1))}
            </Typography>
          </Box>
          <Typography className='confirm-note'>
            Si une carte est déjà enregistrée, le montant sera débité immédiatement et votre facture vous sera envoyée par mail. Sinon, vous serez redirigé vers
            Stripe pour finaliser le paiement.
          </Typography>
        </>
      )}
    </DialogContent>
    <DialogActions className='confirm-actions'>
      <Button onClick={onCancel} disabled={isPending} name='cancel-credit-purchase' className='confirm-cancel'>
        Annuler
      </Button>
      <Button
        variant='contained'
        onClick={onConfirm}
        disabled={isPending}
        name='confirm-credit-purchase'
        className='confirm-submit'
        startIcon={isPending ? <CircularProgress size={14} color='inherit' /> : undefined}
      >
        Confirmer l'achat
      </Button>
    </DialogActions>
  </Dialog>
);
