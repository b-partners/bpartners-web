import { Box, Typography, Button } from '@mui/material';
import { Inbox as InboxIcon } from '@mui/icons-material';
import { InvoiceStatus } from 'bpartners-react-client';
import { FC } from 'react';

interface EmptyInvoiceListProps {
  createInvoice: (status: InvoiceStatus) => void;
}

const BUTTON_STYLE = { margin: '1rem', width: '12rem' };

export const EmptyInvoiceList: FC<EmptyInvoiceListProps> = ({ createInvoice }) => {
  return (
    <Box sx={{ width: '100%', height: '80vh', display: 'flex', alignItems: 'flex-start', justifyContent: 'center' }}>
      <Box sx={{ textAlign: 'center' }}>
        <InboxIcon sx={{ fontSize: '13rem', color: 'rgba(0,0,0,0.4)' }} />
        <Typography variant='h4' sx={{ color: 'rgba(0,0,0,0.4)' }}>
          Pas encore de devis/facture.
        </Typography>
        <Typography sx={{ color: 'rgba(0,0,0,0.4)', my: '1rem' }}>Voulez-vous en créer un ?</Typography>
        <Box>
          <Button name='create-draft-invoice' sx={BUTTON_STYLE} onClick={() => createInvoice(InvoiceStatus.DRAFT)}>
            Créer un devis
          </Button>
          <Button name='create-confirmed-invoice' sx={BUTTON_STYLE} onClick={() => createInvoice(InvoiceStatus.CONFIRMED)}>
            Créer une facture
          </Button>
        </Box>
      </Box>
    </Box>
  );
};