import { AddLink as AddLinkIcon, Clear as ClearIcon } from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { useNotify, useRefresh } from 'react-admin';
import { transactionSupportingDocProvider } from 'src/providers';
import { justifyTransaction } from 'src/providers/transaction-provider';
import InvoiceListSelection, { SelectedInvoiceTable } from './InvoiceListSelection';

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
  const [file, setFile] = useState(null);

  const handleRowClick = (_id, _resource, record) => {
    setInvoiceToLink(record);
    setFile(null);
  };

  const handleImportFile = file => {
    const targetFile = file.target.files[0];

    if (targetFile?.name) {
      const maxSizeInBytes = 2 * 1024 * 1024; // 2 Mo

      if (targetFile.size > maxSizeInBytes) {
        notify('La taille du fichier dépasse la limite autorisée (2 Mo). Veuillez choisir un fichier plus petit.', { type: 'error' });
        file.target.value = null;
        return;
      }
      setFile(file);
      setInvoiceToLink(null);
    }
  };

  const fetch = async () => {
    await justifyTransaction(id, invoiceToLink.id);
    notify(`La transaction "${label}" a été associée au justificatif "${invoiceToLink.title}."`, { type: 'success' });
    close();
    refresh();
  };

  const importFileSubmit = async () => {
    const resources = { file: file, tId: id };
    await transactionSupportingDocProvider.saveOrUpdate(resources);
    notify('Document ajouté avec succès.', { type: 'success' });
    close();
    refresh();
  };

  const handleSubmit = () => {
    setLoading(true);
    if (invoiceToLink && !file) {
      fetch()
        .catch(() => notify('messages.global.error', { type: 'error' }))
        .finally(() => setLoading(false));
    } else {
      importFileSubmit()
        .catch(() => notify('messages.global.error', { type: 'error' }))
        .finally(() => setLoading(false));
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
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', margin: 0, padding: 0 }}>
              {invoiceToLink && !file ? (
                <SelectedInvoiceTable invoice={invoiceToLink} />
              ) : file ? (
                <Chip sx={{ marginTop: '0.3rem', marginLeft: '0.3rem' }} label={file?.target.files[0].name} onDelete={() => setFile(null)} />
              ) : (
                <Typography>Veuillez sélectionner une facture </Typography>
              )}
              {!file && (
                <Typography>
                  ou{' '}
                  <label htmlFor='attachment-input' style={{ textDecoration: 'underline', cursor: 'pointer' }}>
                    importer un document
                  </label>
                  <input id='attachment-input' style={{ display: 'none' }} onChange={handleImportFile} type='file' accept='.png, .jpg, .jpeg, .pdf' />
                </Typography>
              )}
            </Box>
          </CardContent>
        </Card>
      </DialogTitle>
      <DialogContent>
        <InvoiceListSelection handleRowClick={handleRowClick} />
      </DialogContent>
      <DialogActions>
        <Button
          id='link-invoice-button-id'
          disabled={isLoading || (!invoiceToLink && !file)}
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
      <Tooltip title='Lier à une facture'>
        <IconButton data-testid={`${transaction.id}-link-invoice-button`} onClick={toggleDialog}>
          <AddLinkIcon />
        </IconButton>
      </Tooltip>
      <SelectionDialog transaction={transaction} open={dialogState} close={toggleDialog} />
    </Box>
  );
};

export default TransactionLinkInvoice;
