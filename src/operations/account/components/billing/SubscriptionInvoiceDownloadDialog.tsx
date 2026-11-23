import { SubscriptionInvoiceSummary } from '@bpartners/typescript-client';
import { Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import { FC } from 'react';
import { SubscriptionInvoiceDownloadDialogStyle } from './style';
import { formatDate, formatEuros } from './utils';

interface SubscriptionInvoiceDownloadDialogProps {
  monthLabel?: string;
  invoices: SubscriptionInvoiceSummary[];
  isPending: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export const SubscriptionInvoiceDownloadDialog: FC<SubscriptionInvoiceDownloadDialogProps> = ({ monthLabel, invoices, isPending, onCancel, onConfirm }) => (
  <Dialog open={!!monthLabel} onClose={isPending ? undefined : onCancel} maxWidth='sm' fullWidth sx={SubscriptionInvoiceDownloadDialogStyle}>
    <DialogTitle className='invoice-download-title'>Factures de {monthLabel}</DialogTitle>
    <DialogContent>
      <Box className='invoice-download-list'>
        {invoices.map(({ id, title, reference, sendingDate, totalPriceWithVat }) => (
          <Box key={id ?? reference} className='invoice-download-item'>
            <Box>
              <Typography className='invoice-download-item-title'>{title || reference}</Typography>
              <Typography className='invoice-download-item-meta'>{[reference, formatDate(sendingDate)].filter(Boolean).join(' · ')}</Typography>
            </Box>
            <Typography className='invoice-download-item-amount'>{formatEuros(totalPriceWithVat)}</Typography>
          </Box>
        ))}
      </Box>
      <Typography className='invoice-download-note'>
        {invoices.length > 1 ? `Les ${invoices.length} factures seront téléchargées au format PDF.` : 'La facture sera téléchargée au format PDF.'}
      </Typography>
    </DialogContent>
    <DialogActions className='invoice-download-actions'>
      <Button onClick={onCancel} disabled={isPending} name='cancel-subscription-invoice-download' className='invoice-download-cancel'>
        Annuler
      </Button>
      <Button
        variant='contained'
        onClick={onConfirm}
        disabled={isPending}
        name='confirm-subscription-invoice-download'
        className='invoice-download-submit'
        startIcon={isPending ? <CircularProgress size={14} color='inherit' /> : undefined}
      >
        Télécharger
      </Button>
    </DialogActions>
  </Dialog>
);
