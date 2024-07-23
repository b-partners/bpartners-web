import SaveIcon from '@mui/icons-material/Save';
import { Autocomplete, Backdrop, Box, Button, CircularProgress, Modal, Paper, TextField, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useRefresh } from 'react-admin';
import { getCurrentAccount, printError } from '@/common/utils';
import { accountProvider, getCached, setCurrentAccount } from '@/providers';
import { BIC_MESSAGE_CONTAINER } from './style';

const AccountConfig = ({ setAccount: setGlobalAccount }) => {
  const [{ accounts, selectedAccount }, setAccounts] = useState({ accounts: [], selectedAccount: null });
  const [{ isLoading, buttonDisable }, setTool] = useState({ isLoading: false, buttonDisable: true });
  const refresh = useRefresh();

  const setIsLoading = value => setTool({ isLoading: value, buttonDisable: true });
  const setButtonDisable = value => setTool({ isLoading, buttonDisable: value });

  const handleGlobalAccount = () => setGlobalAccount(selectedAccount);

  const handleSubmit = e => {
    e.preventDefault();
    setIsLoading(true);
    const submit = async () => {
      await setCurrentAccount(selectedAccount.id);
      handleGlobalAccount();
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
    <Box>
      <Paper sx={BIC_MESSAGE_CONTAINER}>
        <Typography variant='p' component='div' sx={{ margin: 2 }}>
          Changer de compte d’encaissement.
        </Typography>
      </Paper>
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
        <Button startIcon={<SaveIcon />} type='submit' disabled={buttonDisable} data-testid='submit-change-account' sx={{ width: 300, marginTop: 1 }}>
          Enregistrer
        </Button>
      </form>
      <Modal open={isLoading}>
        <Backdrop open={isLoading}>
          <CircularProgress size={40} />
        </Backdrop>
      </Modal>
    </Box>
  );
};

export default AccountConfig;
