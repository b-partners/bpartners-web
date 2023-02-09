import { useState } from 'react';
import { AddLink as AddLinkIcon, Clear as ClearIcon } from '@mui/icons-material';
import { Box, Button, Dialog, DialogTitle, DialogActions, DialogContent, Typography, CircularProgress, IconButton, Tooltip } from '@mui/material';
import InvoiceListSelection from './InvoiceListSelection';
import { useNotify, useRefresh } from 'react-admin';
import { justifyTransaction } from 'src/providers/transaction-provider';

const SelectionDialog = props => {
  const {
    transaction: { label, id },
    open,
    close,
  } = props;
  const notify = useNotify();
  const refresh = useRefresh();
  const [isLoading, setLoading] = useState(false);
  const [invoiceToLink, setInvoiceToLink] = useState(null);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      await justifyTransaction(id, invoiceToLink.id);
      notify(`La transaction "${label}" à été associer au devis "${invoiceToLink.title}"`, { type: 'success' });
      refresh();
      close();
    } catch (e) {
      notify("Une erreur s'est produite", { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog fullWidth={true} maxWidth='md' open={open} onClose={close}>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography>Liée la transaction "{label}" à un devis :</Typography>
          <Tooltip title='Annuler'>
            <IconButton onClick={close}>
              <ClearIcon data-testid='closeIcon' />
            </IconButton>
          </Tooltip>
        </Box>
      </DialogTitle>
      <DialogContent>
        <InvoiceListSelection onSelectInvoice={setInvoiceToLink} />
      </DialogContent>
      <DialogActions>
        <Button disabled={isLoading || !invoiceToLink} endIcon={isLoading && <CircularProgress size={20} sx={{ color: 'white' }} />} onClick={handleSubmit}>
          Enregistrer
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const TransactionLinkInvoice = props => {
  const [dialogState, setDialogState] = useState(false);
  const { transaction } = props;

  const toggleDialog = e => {
    e && e.stopPropagation();
    setDialogState(e => !e);
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
      <Tooltip title='Liée à un devis'>
        <IconButton>
          <AddLinkIcon onClick={toggleDialog} />
        </IconButton>
      </Tooltip>
      <SelectionDialog transaction={transaction} open={dialogState} close={toggleDialog} />
    </Box>
  );
};

export default TransactionLinkInvoice;
