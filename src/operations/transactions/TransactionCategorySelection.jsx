import { AddCircleOutlineRounded, Edit } from '@mui/icons-material';
import { Autocomplete, Box, Button, Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNotify, useRefresh } from 'react-admin';
import { BP_COLOR } from 'src/bp-theme';
import { printError } from 'src/common/utils';
import { transactionCategoryProvider } from 'src/providers';

const ICON_STYLE = {
  color: BP_COLOR[30],
  cursor: 'pointer',
};

const successMessage = category => `resources.transactions.category.${!category ? 'add' : 'edit'}`;

const CustomsAutocomplete = props => {
  const { onChange, transactionType } = props;
  const [autocompleteData, setAutocompleteData] = useState(null);

  useEffect(() => {
    const dateFilter = new Date().toISOString().slice(0, 10);
    const getTransactionCategory = async () => {
      const transactionCategoryList = await transactionCategoryProvider.getList(dateFilter, dateFilter, transactionType);
      setAutocompleteData(transactionCategoryList);
    };
    getTransactionCategory().catch(printError);
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

  const onSubmit = () => {
    const fetch = async () => {
      const { comment, type, vat } = selectedCategory;
      await transactionCategoryProvider.saveOrUpdate(id, { vat: vat * 100, type, comment });
      notify(successMessage(category), { type: 'success' });
      refresh();
    };

    setLoading(true);
    fetch()
      .catch(() => notify('messages.global.error', { type: 'error' }))
      .finally(() => {
        close();
        setLoading(false);
      });
  };

  return (
    <Dialog open={open} onClose={close}>
      <DialogTitle>
        <Typography>Catégorisez votre transaction :</Typography>
        {label}
      </DialogTitle>
      <DialogContent>
        {category &&
          category.map(({ description, comment }, k) => (
            <Chip key={`chip-category-key-${k}`} sx={{ margin: '0.1rem' }} label={description || comment} variant='outlined' size='small' />
          ))}
        <Box sx={{ display: 'flex', flexDirection: 'column', marginTop: 1 }}>
          <CustomsAutocomplete transactionType={type} onChange={setSelectedCategory} />
          {selectedCategory !== null && selectedCategory.isOther && (
            <>
              <TextField value={selectedCategory.comment || ''} required onChange={handleChange} name='comment' label='Commentaire' />
              <TextField value={selectedCategory.vat || ''} required onChange={handleChange} type='number' name='vat' label='TVA customisé' />
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
      {category && category.map((cat, k) => <Chip label={cat.type} key={`${cat}-${k}`} variant='outlined' size='small' />)}
      {!category ? (
        <AddCircleOutlineRounded data-testid={`transaction-add-category-${transaction.id}`} onClick={toggleDialog} sx={ICON_STYLE} />
      ) : (
        <Edit data-testid={`transaction-edit-category-${transaction.id}`} onClick={toggleDialog} sx={ICON_STYLE} />
      )}
      <SelectionDialog transaction={transaction} open={dialogState} close={toggleDialog} />
    </Box>
  );
};

export default TransactionCategorySelection;
