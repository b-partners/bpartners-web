import { getCurrentAccount, printError } from '@/common/utils';
import { accountProvider, getCached, setCurrentAccount } from '@/providers';
import { Account } from '@bpartners/typescript-client';
import SaveIcon from '@mui/icons-material/Save';
import { Autocomplete, Backdrop, Box, Button, CircularProgress, Modal, Paper, TextField, Typography } from '@mui/material';
import { FC, FormEvent, SyntheticEvent, useEffect, useState } from 'react';
import { useRefresh } from 'react-admin';
import { BIC_MESSAGE_CONTAINER } from './style';

interface AccountConfigProps {
  setAccount: (account: Account) => void;
}

const AccountConfig: FC<AccountConfigProps> = ({ setAccount: setGlobalAccount }) => {
  const [{ accounts, selectedAccount }, setAccounts] = useState({ accounts: [], selectedAccount: null });
  const [{ isLoading, buttonDisable }, setTool] = useState({ isLoading: false, buttonDisable: true });
  const refresh = useRefresh();

  const setIsLoading = (value: boolean) => setTool({ isLoading: value, buttonDisable: true });
  const setButtonDisable = (value: boolean) => setTool({ isLoading, buttonDisable: value });

  const handleGlobalAccount = () => setGlobalAccount(selectedAccount);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const submit = async () => {
      await setCurrentAccount(selectedAccount.id);
      handleGlobalAccount();
      setButtonDisable(true);
    };
    if (selectedAccount !== null) submit().catch(printError).finally(refresh);
  };

  const handleChange = (_event: SyntheticEvent, value: Account) => {
    if (value.id !== getCached.account().id) {
      setButtonDisable(false);
    }
    setAccounts(e => ({ ...e, selectedAccount: value }));
  };

  useEffect(() => {
    const fetchAccounts = async () => {
      const fetched = await accountProvider.getList(1, 500, {});
      const currentAccount = getCurrentAccount(fetched);
      setAccounts({ accounts: fetched, selectedAccount: currentAccount });
    };
    fetchAccounts().catch(printError);
  }, []);

  return (
    <Box>
      <Paper sx={BIC_MESSAGE_CONTAINER}>
        <Typography variant='body1' component='div' sx={{ margin: 2 }}>
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
