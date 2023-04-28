import { AccountBalance as AccountBalanceIcon, LinkOff as LinkOffIcon } from '@mui/icons-material';
import {
  Backdrop,
  Box,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Modal,
  Paper,
  Stack,
  Typography,
  Button,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { redirect } from 'src/common/utils/redirect';
import { disconnectBank, initiateBankConnection, singleAccountGetter } from 'src/providers/account-provider';
import authProvider from 'src/providers/auth-provider';
import { BankInformationForm } from './BankInformationForm';
import { BALANCE_ICON, BANK_CARD, BANK_LOGO, DISCONNECT_BANK_LOGO, HERE_LINK, NO_BANK_CARD, TEXT_MESSAGE } from './style';
import { useNotify } from 'react-admin';

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

const NoBank = () => {
  const [isLoading, setLoading] = useState(false);

  const initiateBankConnectionAsync = async () => {
    setLoading(true);
    const redirectionUrl = await initiateBankConnection();
    redirect(redirectionUrl.redirectionUrl);
  };

  return (
    <Card
      sx={{
        border: 'none',
        outline: 'none',
      }}
    >
      <CardContent>
        <Paper sx={NO_BANK_CARD}>
          <AccountBalanceIcon style={BALANCE_ICON} />
          <Box sx={{ zIndex: 2, m: 5, '.MuiTypography-root': { fontSize: '1.3rem' } }}>
            <Typography component='div' variant='p'>
              Aucune banque associée.
            </Typography>
            <Typography component='div' variant='p' mt={15}>
              Cliquez{' '}
              <span data-testid='initiate-bank-connection-button' style={HERE_LINK} onClick={initiateBankConnectionAsync}>
                ici
              </span>{' '}
              pour associée une banque.
            </Typography>
          </Box>
        </Paper>
        <Backdrop open={isLoading} />
        <Modal open={isLoading}>
          <Backdrop open={isLoading} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1999 }}>
            <CircularProgress />
          </Backdrop>
        </Modal>
      </CardContent>
    </Card>
  );
};

const Bank = ({ account, setAccount }) => {
  const [isDialogOpen, setDialogState] = useState(false);

  const handleCloseDialog = () => setDialogState(false);
  const handleOpenDialog = () => setDialogState(true);

  return (
    <>
      <BankDisconnection setAccount={setAccount} isOpen={isDialogOpen} onClose={handleCloseDialog} bank={account.bank} />
      <Card
        sx={{
          border: 'none',
          outline: 'none',
        }}
      >
        <CardHeader title='Ma banque' />
        <CardContent>
          <Stack direction='row' spacing={2}>
            <Paper sx={BANK_CARD}>
              <img src={account.bank.logoUrl} style={BANK_LOGO} alt='bank-logo' />
              <IconButton sx={DISCONNECT_BANK_LOGO} title='Déconnecter cette banque.' onClick={handleOpenDialog}>
                <LinkOffIcon />
              </IconButton>
              <Typography mt={1} variant='h4'>
                {account.bank.name}
              </Typography>
              <Box>
                <BankCardText label={account.name} title='Nom du compte' />
                <BankCardText label={account.bic} title='BIC' />
                <BankCardText label={account.iban} title='IBAN' />
              </Box>
            </Paper>
            <BankInformationForm setAccount={setAccount} account={account} />
          </Stack>
        </CardContent>
      </Card>
    </>
  );
};

const BankCardText = ({ title, label, ...others }) => (
  <Box {...others}>
    <Typography variant='p' component='div'>
      {title}
    </Typography>
    <Typography component='div' variant='p' style={TEXT_MESSAGE}>
      {label}
    </Typography>
  </Box>
);

const BankDisconnection = ({ isOpen, onClose, bank, setAccount }) => {
  const [isLoading, setLoading] = useState(false);
  const notify = useNotify();
  const handleDisconnectBank = async () => {
    setLoading(true);
    try {
      const newAccount = await disconnectBank();
      setAccount(newAccount);
      onClose();
      notify('messages.disconnection.success', { type: 'success' });
    } catch (e) {
      notify('messages.global.error', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };
  return (
    <Dialog open={isOpen} onClose={onClose}>
      <DialogTitle id='alert-dialog-title'>Confirmation</DialogTitle>
      <DialogContent sx={{ width: 500 }}>
        <DialogContentText>
          Voulez vous déconnecter la banque <b>{bank.name}</b> ?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button disabled={isLoading} onClick={handleDisconnectBank} data-testid='bank-disconnection-button'>
          Déconnecter
        </Button>
        <Button disabled={isLoading} onClick={onClose}>
          Annuler
        </Button>
      </DialogActions>
    </Dialog>
  );
};
