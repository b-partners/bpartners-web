import { Backdrop, Box, Paper, Typography, Card, CardHeader, CardContent, Button, CardActions } from '@mui/material';
import { AccountBalance as AccountBalanceIcon, Save as SaveIcon } from '@mui/icons-material';
import { BANK_CARD, HERE_LINK, BALANCE_ICON, BANK_LOGO } from './style';
import { useEffect, useState } from 'react';
import { initiateBankConnection, singleAccountGetter, updateBankInformation } from 'src/providers/account-provider';
import { redirect } from 'src/common/utils/redirect';
import { FormProvider, useForm } from 'react-hook-form';
import { BpFormField } from 'src/common/components';
import authProvider from 'src/providers/auth-provider';
import { useNotify, useRefresh } from 'react-admin';

export const BankPage = () => {
  const [account, setAccount] = useState(null);

  useEffect(() => {
    const updateAccount = async () => {
      const {
        user: { id },
      } = authProvider.getCachedWhoami();
      const currentAccount = await singleAccountGetter(id);
      setAccount(currentAccount);
    };
    updateAccount();
  }, []);

  return account && account.bank ? <Bank account={account} setAccount={setAccount} /> : <NoBank account={account} />;
};

const BankInformation = props => {
  const {
    account: {
      bank: { name },
      bic,
      iban,
    },
    setAccount,
  } = props;
  const form = useForm({ mode: 'all', defaultValues: { name, bic, iban } });
  const [isLoading, setLoading] = useState(false);
  const notify = useNotify();
  const refresh = useRefresh();

  const handleSubmit = form.handleSubmit(async bankInfo => {
    setLoading(true);
    try {
      const newAccount = await updateBankInformation(bankInfo);
      refresh();
      setAccount(newAccount);
    } catch {
      notify("Une erreur s'est produite", { type: 'error' });
    } finally {
      setLoading(false);
    }
  });

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
        <BpFormField name='bic' label='BIC' />
        <Button type='submit' sx={{ width: 300, marginTop: 1 }} disabled={isLoading} startIcon={<SaveIcon />}>
          Enregistrer
        </Button>
      </form>
    </FormProvider>
  );
};
const NoBank = () => {
  const [isLoading, setLoading] = useState(false);

  const initiateBankConnectionAsync = async () => {
    setLoading(true);
    const redirectionUrl = await initiateBankConnection();
    redirect(redirectionUrl.redirectionUrl);
  };

  return (
    <Box>
      <Paper sx={BANK_CARD} elevation={3}>
        <AccountBalanceIcon style={BALANCE_ICON} />
        <Typography variant='h6'>Aucune banque associée.</Typography>
        <Typography variant='h6' sx={{ textAlign: 'center', marginTop: 10 }}>
          Cliquez{' '}
          <span data-testid='initiate-bank-connection-button' href='#' style={HERE_LINK} onClick={initiateBankConnectionAsync}>
            ici
          </span>{' '}
          pour associée une banque.
        </Typography>
      </Paper>
      <Backdrop open={isLoading} />
    </Box>
  );
};

const Bank = ({ account, setAccount }) => (
  <Card>
    <CardHeader title='Ma banque' />
    <CardContent>
      <Paper sx={BANK_CARD}>
        {
          // eslint-disable-next-line jsx-a11y/alt-text
          <img src={account.bank.logoUrl} style={BANK_LOGO} />
        }
        <Typography variant='h4'>{account.bank.name}</Typography>
        <br />
        <Typography variant='p'>Nom du compte</Typography>
        <br />
        <Typography variant='h6'>
          <b>{account.name}</b>
        </Typography>
        <br />
        <Typography variant='p'>BIC</Typography>
        <br />
        <Typography variant='h6'>
          <b>{account.bic}</b>
        </Typography>
        <br />
        <Typography variant='p'>IBAN</Typography>
        <br />
        <Typography variant='h6'>
          <b>{account.iban}</b>
        </Typography>
      </Paper>
    </CardContent>
    <CardActions sx={{ marginLeft: 1 }}>
      <BankInformation setAccount={setAccount} account={account} />
    </CardActions>
  </Card>
);
