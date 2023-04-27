import { AccountBalance as AccountBalanceIcon, Save as SaveIcon } from '@mui/icons-material';
import { Backdrop, Box, Button, Card, CardActions, CardContent, CardHeader, CircularProgress, Modal, Paper, Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNotify, useRefresh } from 'react-admin';
import { FormProvider, useForm } from 'react-hook-form';
import { BpFormField } from 'src/common/components';
import { redirect } from 'src/common/utils/redirect';
import { initiateBankConnection, singleAccountGetter, updateBankInformation } from 'src/providers/account-provider';
import authProvider from 'src/providers/auth-provider';
import { BALANCE_ICON, BANK_CARD, BANK_INFORMATION_CONTAINER, BANK_LOGO, BIC_MESSAGE_CONTAINER, HERE_LINK } from './style';

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
    account: { name, bic, iban },
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
    <Box>
      <Paper sx={BIC_MESSAGE_CONTAINER}>
        <Typography variant='p' component='div' sx={{ margin: 2 }}>
          Pour finaliser votre synchronisation de compte bancaire, veuillez renseigner votre BIC présent sur votre RIB et enregistrer.
        </Typography>
      </Paper>
      <FormProvider {...form}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
          <BpFormField name='name' label='Nom du compte' />
          <BpFormField name='bic' label='BIC' />
          <BpFormField name='iban' label='IBAN' />
          <Button type='submit' sx={{ width: 300, marginTop: 1 }} disabled={isLoading} startIcon={<SaveIcon />}>
            Enregistrer
          </Button>
        </form>
      </FormProvider>
    </Box>
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
      <Modal open={isLoading}>
        <Backdrop open={isLoading} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1999 }}>
          <CircularProgress />
        </Backdrop>
      </Modal>
    </Box>
  );
};

const Bank = ({ account, setAccount }) => (
  <Card>
    <CardHeader title='Ma banque' />
    <CardContent>
      <Stack direction='row' spacing={2}>
        <Paper sx={BANK_CARD}>
          {
            // eslint-disable-next-line jsx-a11y/alt-text
            <img src={account.bank.logoUrl} style={BANK_LOGO} />
          }
          <Typography mt={1} variant='h4'>
            {account.bank.name}
          </Typography>
          <div style={{ height: '3rem' }}></div>
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
        <BankInformation setAccount={setAccount} account={account} />
      </Stack>
    </CardContent>
  </Card>
);
