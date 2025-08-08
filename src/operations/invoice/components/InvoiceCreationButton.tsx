import { PALETTE_COLORS } from '@/bp-theme';
import PopoverButton from '@/common/components/PopoverButton';
import { InvoiceStatus } from '@bpartners/typescript-client';
import { Add as AddIcon } from '@mui/icons-material';
import { Box, Button, SxProps } from '@mui/material';
import { FC } from 'react';

interface InvoiceCreationButtonProps {
  createInvoice: (type: InvoiceStatus) => void;
}

const BUTTON_CONTAINER_STYLE = {
  width: '13rem',
  padding: 0.5,
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'center',
  '& .MuiButton-root': {
    background: PALETTE_COLORS.pine,
    margin: 1,
    display: 'block',
    width: '12rem',
    '&:hover': {
      background: PALETTE_COLORS.forest,
    },
  },
};

const addButtonStyle: SxProps = {
  marginRight: 5.2,
  '& .MuiIconButton-root': {
    background: `${PALETTE_COLORS.pine} !important`,
  },
};

export const InvoiceCreationButton: FC<InvoiceCreationButtonProps> = ({ createInvoice }) => (
  <PopoverButton style={addButtonStyle} icon={<AddIcon />} label='Créer un nouveau devis'>
    <Box sx={BUTTON_CONTAINER_STYLE}>
      <Button name='create-draft-invoice' onClick={() => createInvoice(InvoiceStatus.DRAFT)}>
        Créer un devis
      </Button>
      <Button name='create-confirmed-invoice' onClick={() => createInvoice(InvoiceStatus.CONFIRMED)}>
        Créer une facture
      </Button>
    </Box>
  </PopoverButton>
);
