import { useDialog } from '@/common/store/dialog';
import { justifyTransaction, transactionSupportingDocProvider } from '@/providers';
import { Clear as ClearIcon } from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material';
import { ChangeEventHandler, FC, useState } from 'react';
import { RowClickFunction, useNotify, useRefresh } from 'react-admin';
import InvoiceListSelection from '../InvoiceListSelection';
import { SelectedInvoiceTable } from './SelectedInvoiceTable';
import { SelectionDialogProps } from './types';

export const SelectionDialog: FC<SelectionDialogProps> = props => {
  const {
    transaction: { label, id },
  } = props;
  const { close } = useDialog();
  const notify = useNotify();
  const refresh = useRefresh();
  const [isLoading, setIsLoading] = useState(false);
  const [invoiceToLink, setInvoiceToLink] = useState(null);
  const [file, setFile] = useState(null);

  const handleRowClick: RowClickFunction = (_id, _resource, record) => {
    setInvoiceToLink(record);
    setFile(null);
    return '';
  };

  const handleImportFile: ChangeEventHandler<HTMLInputElement> = file => {
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
    await transactionSupportingDocProvider.saveOrUpdate(resources as unknown as []);
    notify('Document ajouté avec succès.', { type: 'success' });
    close();
    refresh();
  };

  const handleSubmit = () => {
    setIsLoading(true);
    if (invoiceToLink && !file) {
      fetch()
        .catch(() => notify('messages.global.error', { type: 'error' }))
        .finally(() => setIsLoading(false));
    } else {
      importFileSubmit()
        .catch(() => notify('messages.global.error', { type: 'error' }))
        .finally(() => setIsLoading(false));
    }
  };

  return (
    <>
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
              {invoiceToLink && !file && <SelectedInvoiceTable invoice={invoiceToLink} />}
              {invoiceToLink && file && (
                <Chip sx={{ marginTop: '0.3rem', marginLeft: '0.3rem' }} label={file?.target.files[0].name} onDelete={() => setFile(null)} />
              )}
              {!invoiceToLink && !file && <Typography>Veuillez sélectionner une facture </Typography>}
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
    </>
  );
};
