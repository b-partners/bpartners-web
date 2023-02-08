import { useState, useEffect } from 'react';
import { AddLink } from '@mui/icons-material';
import {
  Autocomplete,
  Box,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  TextField,
  Typography,
  CircularProgress,
  IconButton,
  Tooltip,
} from '@mui/material';
import { useNotify, useRefresh } from 'react-admin';
import transactionCategoryProvider from 'src/providers/transaction-category-provider';
import { BP_COLOR } from 'src/bpTheme';

const ICON_STYLE = {
  color: BP_COLOR[30],
  cursor: 'pointer',
};

const successMessage = category => {
  return !category ? 'La catégorie a bien été ajoutée' : 'La catégorie a bien été modifiée';
};

const CustomsAutocomplete = props => {
  const { onChange, transactionType } = props;
  const [autocompleteData, setAutocompleteData] = useState(null);

  useEffect(() => {
    const dateFilter = new Date().toISOString().slice(0, 10);
    const getTransactionCategory = async () => {
      const transactionCategoryList = await transactionCategoryProvider.getList(dateFilter, dateFilter, transactionType);
      setAutocompleteData(transactionCategoryList);
    };
    getTransactionCategory();
  }, [transactionType]);

  const handleChange = (e, value) => {
    onChange(value);
  };

  return (
    <Autocomplete
      onChange={handleChange}
      getOptionLabel={e => e.description}
      options={autocompleteData || []}
      loading={autocompleteData === null}
      loadingText='Chargement...'
      renderInput={params => <TextField required {...params} sx={{ minWidth: '20vw' }} label='Catégories' />}
    />
  );
};

const SelectionDialog = props => {
  const notify = useNotify();
  const refresh = useRefresh();
  const {
    transaction: { label, category, id, type },
    open,
    close,
  } = props;
  const [isLoading, setLoading] = useState(false);
  const [invoiceList, setInvoiceList] = useState([]);

  const onSubmit = async () => {};

  const handleChange = e => {};

  return (
    <Dialog open={open} onClose={close}>
      <DialogTitle>
        <Typography>Liée la transaction "{label}" à un devis :</Typography>
      </DialogTitle>
      <DialogContent>
        <Box>
          <TextField onChange={handleChange} />
          <Box>{}</Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button endIcon={isLoading && <CircularProgress size={20} sx={{ color: 'white' }} />} onClick={onSubmit} disabled={!validator()}>
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
          <AddLink onClick={toggleDialog} />
        </IconButton>
      </Tooltip>
      <SelectionDialog transaction={transaction} open={dialogState} close={toggleDialog} />
    </Box>
  );
};

export default TransactionLinkInvoice;
