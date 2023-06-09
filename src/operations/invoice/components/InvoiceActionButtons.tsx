import ArchiveBulkAction from '../../../common/components/ArchiveBulkAction';
import PopoverButton from '../../../common/components/PopoverButton';
import { Box, Button } from '@mui/material';
// @ts-ignore
import { Add as AddIcon } from '@mui/icons-material';
import { useInvoceContextEdition } from '../../../common/hooks';

export const InvoiceActionButtons = () => {
  const { createDraftInvoice, createConfirmedInvoice } = useInvoceContextEdition();

  return (
    <>
      <ArchiveBulkAction source='title' statusName='archiveStatus' />
      <PopoverButton style={{ marginRight: 5.2 }} icon={<AddIcon />} label='Créer un nouveau devis'>
        <Box sx={{ width: '13rem', padding: 0.5, display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Button name='create-draft-invoice' onClick={createDraftInvoice} sx={{ margin: 1, display: 'block', width: '12rem' }}>
            Créer un devis
          </Button>
          <Button name='create-confirmed-invoice' onClick={createConfirmedInvoice} sx={{ margin: 1, display: 'block', width: '12rem' }}>
            Créer une facture
          </Button>
        </Box>
      </PopoverButton>
    </>
  );
};
