import { Box, Button } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import PopoverButton from 'src/common/components/PopoverButton';
import { InvoiceStatus } from '@bpartners/typescript-client';
import { FC } from 'react';

interface InvoiceCreationButtonProps {
  createInvoice: (type: InvoiceStatus) => void;
}

const BUTTON_CONTAINER_STYLE = { width: '13rem', padding: 0.5, display: 'flex', flexWrap: 'wrap', justifyContent: 'center' };
const BUTTON_STYLE = { margin: 1, display: 'block', width: '12rem' };

export const InvoiceCreationButton: FC<InvoiceCreationButtonProps> = ({ createInvoice }) => (
  <PopoverButton style={{ marginRight: 5.2 }} icon={<AddIcon />} label='Créer un nouveau devis'>
    <Box sx={BUTTON_CONTAINER_STYLE}>
      <Button name='create-draft-invoice' onClick={() => createInvoice(InvoiceStatus.DRAFT)} sx={BUTTON_STYLE}>
        Créer un devis
      </Button>
      <Button name='create-confirmed-invoice' onClick={() => createInvoice(InvoiceStatus.CONFIRMED)} sx={BUTTON_STYLE}>
        Créer une facture
      </Button>
    </Box>
  </PopoverButton>
);
