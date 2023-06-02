import { Modal, Button, TextField, Backdrop, Autocomplete, CircularProgress } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { useEffect, useState } from 'react';
import { accountProvider, getCached, setCurrentAccount } from 'src/providers';
import { getCurrentAccount, printError } from 'src/common/utils';
import { useRefresh } from 'react-admin';

const AccountConfig = () => {
  const [{ accounts, selectedAccount }, setAccounts] = useState({ accounts: [], selectedAccount: null });
  const [{ isLoading, buttonDisable }, setTool] = useState({ isLoading: false, buttonDisable: true });
  const refresh = useRefresh();

  const setIsLoading = value => setTool({ isLoading: value, buttonDisable: true });
  const setButtonDisable = value => setTool({ isLoading, buttonDisable: value });

  const handleSubmit = e => {
    e.preventDefault();
    setIsLoading(true);
    const submit = async () => {
      await setCurrentAccount(selectedAccount.id);
      setButtonDisable(true);
    };
    if (selectedAccount !== null) submit().catch(printError).finally(refresh);
  };

  const handleChange = (_event, value) => {
    if (value.id !== getCached.account().id) {
      setButtonDisable(false);
    }
    setAccounts(e => ({ ...e, selectedAccount: value }));
  };

  useEffect(() => {
    const fetchAccounts = async () => {
      const fetched = await accountProvider.getList();
      const currentAccount = getCurrentAccount(fetched);
      setAccounts({ accounts: fetched, selectedAccount: currentAccount });
    };
    fetchAccounts().catch(printError);
  }, []);

  return (
    <>
      <form onSubmit={handleSubmit}>
        <Autocomplete
          options={accounts}
          value={selectedAccount}
          onChange={handleChange}
          noOptionsText='...'
          getOptionLabel={account => account.name}
          sx={{ width: 300 }}
          renderInput={params => <TextField {...params} label='Mon compte' />}
        />
        <Button
          variant='contained'
          size='small'
          startIcon={<SaveIcon />}
          type='submit'
          disabled={buttonDisable}
          name='submitChangeAccount'
          data-testid='submit-change-account'
          sx={{ width: 'min-content', mt: 1 }}
        >
          Enregistrer
        </Button>
      </form>
      <Modal open={isLoading}>
        <Backdrop open={isLoading}>
          <CircularProgress size={40} />
        </Backdrop>
      </Modal>
    </>
  );
};

export default AccountConfig;
