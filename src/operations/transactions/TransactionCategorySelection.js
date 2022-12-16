import { useState, useEffect } from 'react';
import { AddCircleOutlineRounded, Edit } from '@mui/icons-material';
import { Autocomplete, Box, Button, Chip, Dialog, DialogTitle, DialogActions, DialogContent, TextField, CircularProgress } from '@mui/material';
import { useNotify, useRefresh } from 'react-admin';
import transactionCategoryProvider from 'src/providers/transaction-category-provider';
import { BP_COLOR } from 'src/bpTheme';

const ICON_STYLE = {
  color: BP_COLOR[30],
  cursor: 'pointer',
};

const successMessage = category => {
  return !category ? 'La catégorie a bien été ajouter' : 'La catégorie a bien été modifier';
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
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isLoading, setLoading] = useState(false);

  const handleChange = event => {
    setSelectedCategory(e => ({ ...e, [event.target.name]: event.target.value }));
  };

  const validator = () => {
    if (selectedCategory) {
      const { comment, type, isOther } = selectedCategory;
      return !isOther ? true : (comment || '').length > 0 && (type || '').length > 0;
    }
    return false;
  };

  const onSubmit = async () => {
    try {
      setLoading(true);
      const { comment, type, vat } = selectedCategory;
      await transactionCategoryProvider.saveOrUpdate(id, { vat, type, comment });
      notify(successMessage(category), { type: 'success' });
      refresh();
    } catch {
      notify("Une erreur s'est produite", { type: 'error' });
    } finally {
      close();
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={close}>
      <DialogTitle>{label}</DialogTitle>
      <DialogContent>
        {category &&
          category.map(({ description, comment }) => <Chip sx={{ margin: '0.1rem' }} label={description || comment} variant='outlined' size='small' />)}
        <Box sx={{ display: 'flex', flexDirection: 'column', marginTop: 1 }}>
          <CustomsAutocomplete transactionType={type} onChange={setSelectedCategory} />
          {selectedCategory !== null && selectedCategory.isOther && (
            <>
              <TextField value={selectedCategory.comment} required onChange={handleChange} name='comment' label='Commentaire' />
              <TextField value={selectedCategory.vat} required onChange={handleChange} type='number' name='vat' label='TVA customisé' />
            </>
          )}
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

const TransactionCategorySelection = props => {
  const [dialogState, setDialogState] = useState(false);
  const { transaction } = props;
  const { category } = transaction;

  const toggleDialog = e => {
    e && e.stopPropagation();
    setDialogState(e => !e);
  };

  return (
    <Box sx={{ width: '10vw', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
      {category && category.map(cat => <Chip label={cat.type} variant='outlined' size='small' />)}
      {!category ? <AddCircleOutlineRounded onClick={toggleDialog} sx={ICON_STYLE} /> : <Edit onClick={toggleDialog} sx={ICON_STYLE} />}
      <SelectionDialog transaction={transaction} open={dialogState} close={toggleDialog} />
    </Box>
  );
};

export default TransactionCategorySelection;
