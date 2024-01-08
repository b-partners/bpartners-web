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
  Chip,
} from '@mui/material';
import InvoiceListSelection, { SelectedInvoiceTable } from './InvoiceListSelection';
import { useNotify, useRefresh } from 'react-admin';
import { justifyTransaction } from 'src/providers/transaction-provider';
import { transactionSupportingDocProvider } from 'src/providers';

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

  const handleSubmit = () => {
    const fetch = async () => {
      await justifyTransaction(id, invoiceToLink.id);
      notify(`La transaction "${label}" a été associée au justificatif "${invoiceToLink.title}."`, { type: 'success' });
      close();
      refresh();
    };
    setLoading(true);
    fetch()
      .catch(() => notify('messages.global.error', { type: 'error' }))
      .finally(() => setLoading(false));
  };

  const handleRowClick = (_id, _resource, record) => {
    setInvoiceToLink(record);
    setFile(null);
  };

  const handleImportFile = file => {
    console.log('file du handleImportFile', file);
    const targetFile = file.target.files[0];
    if (targetFile?.name) {
      console.log('tu es dans la condition');
      setFile(file);
      setInvoiceToLink(null);
    }
  };
  const importFileSubmit = async () => {
    console.log('file submit', file);
    const resources = { file: file, tId: id };
    try {
      await transactionSupportingDocProvider.saveOrUpdate(resources);
      notify('Document ajouté avec succès.', { type: 'success' });
    } catch (error) {
      notify('messages.global.error', { type: 'error' });
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
                  <input id='attachment-input' style={{ display: 'none' }} onChange={handleImportFile} type='file' />
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
          disabled={isLoading || !invoiceToLink}
          endIcon={isLoading && <CircularProgress size={20} sx={{ color: 'white' }} />}
          onClick={handleSubmit}
        >
          Enregistrer
        </Button>
        <Button onClick={importFileSubmit}>Enregistrer le fichier importé</Button>
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
        <IconButton data-testid={`${transaction.id}-link-invoice-button`} onClick={toggleDialog}>
          <AddLinkIcon />
        </IconButton>
      </Tooltip>
      <SelectionDialog transaction={transaction} open={dialogState} close={toggleDialog} />
    </Box>
  );
};

export default TransactionLinkInvoice;
