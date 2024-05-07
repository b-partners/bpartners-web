import { InvoiceStatus } from '@bpartners/typescript-client';
import { Inbox as InboxIcon } from '@mui/icons-material';
import { Box, Button, Typography } from '@mui/material';
import { FC, ReactNode } from 'react';

interface EmptyInvoiceListProps {
  createInvoice: (status: InvoiceStatus) => void;
  actions?: ReactNode;
}

export const EMPTY_BUTTON_STYLE = { margin: '1rem', width: '12rem' };

export const EmptyInvoiceList: FC<EmptyInvoiceListProps> = ({ createInvoice, actions }) => {
  return (
    <Box sx={{ width: '100%', height: '80vh', display: 'flex', alignItems: 'flex-start', justifyContent: 'center' }}>
      <Box sx={{ textAlign: 'center' }}>
        <InboxIcon sx={{ fontSize: '13rem', color: 'rgba(0,0,0,0.4)' }} />
        <Typography variant='h4' sx={{ color: 'rgba(0,0,0,0.4)' }}>
          Pas encore de devis/facture.
        </Typography>
        <Typography sx={{ color: 'rgba(0,0,0,0.4)', my: '1rem' }}>Voulez-vous en créer un ?</Typography>
        <Box>
          <Button name='create-draft-invoice' sx={EMPTY_BUTTON_STYLE} onClick={() => createInvoice(InvoiceStatus.DRAFT)}>
            Créer un devis
          </Button>
          <Button name='create-confirmed-invoice' sx={EMPTY_BUTTON_STYLE} onClick={() => createInvoice(InvoiceStatus.CONFIRMED)}>
            Créer une facture
          </Button>
          {actions}
        </Box>
      </Box>
    </Box>
  );
};
