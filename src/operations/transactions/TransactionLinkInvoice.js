import { useState } from 'react';
import { AddLink as AddLinkIcon, Clear as ClearIcon } from '@mui/icons-material';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  Typography,
  CircularProgress,
  IconButton,
  Tooltip,
  Card,
  CardContent,
} from '@mui/material';
import InvoiceListSelection, { SelectedInvoiceTable } from './InvoiceListSelection';
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
      close();
      refresh();
    } catch (e) {
      notify("Une erreur s'est produite", { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog sx={{ height: '80vh', minHeight: '80vh' }} fullWidth={true} maxWidth='md' open={open} onClose={close}>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
          <Typography>Lier la transaction "{label}" à une facture :</Typography>
          <Tooltip title='Annuler'>
            <IconButton onClick={close}>
              <ClearIcon data-testid='closeIcon' />
            </IconButton>
          </Tooltip>
        </Box>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: 0, padding: 0 }}>
              {invoiceToLink ? <SelectedInvoiceTable invoice={invoiceToLink} /> : <Typography>Veuillez sélectionner un devis</Typography>}
            </Box>
          </CardContent>
        </Card>
      </DialogTitle>
      <DialogContent>
        <InvoiceListSelection onSelectInvoice={setInvoiceToLink} />
      </DialogContent>
      <DialogActions>
        <Button
          id='link-invoice-button-id'
          disabled={isLoading || !invoiceToLink}
          endIcon={isLoading && <CircularProgress size={20} sx={{ color: 'white' }} />}
          onClick={handleSubmit}
        >
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
      <Tooltip title='Lier à un devis'>
        <IconButton>
          <AddLinkIcon onClick={toggleDialog} />
        </IconButton>
      </Tooltip>
      <SelectionDialog transaction={transaction} open={dialogState} close={toggleDialog} />
    </Box>
  );
};

export default TransactionLinkInvoice;
