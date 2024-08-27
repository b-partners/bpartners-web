import { handleSubmit, printError, Redirect } from '@/common/utils';
import { accountProvider, bankProvider, getCached } from '@/providers';
import { Account, Bank as BankType } from '@bpartners/typescript-client';
import { AccountBalance as AccountBalanceIcon } from '@mui/icons-material';
import {
  Backdrop,
  Box,
  BoxProps,
  Button,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Modal,
  Paper,
  Stack,
  Toolbar,
  Typography,
} from '@mui/material';
import { CSSProperties, Dispatch, FC, ReactNode, SetStateAction, useEffect, useState } from 'react';
import { useNotify } from 'react-admin';
import AccountConfig from './AccountConfig';
import { BankInformationForm } from './BankInformationForm';
import { BALANCE_ICON, BANK_CARD, BANK_LOGO, CARD_CONTENT, HERE_LINK, NO_BANK_CARD, TEXT_MESSAGE } from './style';

export const BankPage = () => {
  const [account, setAccount] = useState(getCached.account());

  useEffect(() => {
    const updateAccount = async () => {
      const currentAccount = await accountProvider.getOne();
      setAccount(currentAccount);
    };
    updateAccount().catch(printError);
  }, []);

  return account && account.bank ? (
    <Bank aside={<AccountConfig setAccount={setAccount} />} account={account} setAccount={setAccount} />
  ) : (
    <NoBank aside={<AccountConfig setAccount={setAccount} />} />
  );
};

const NoBank = ({ aside }: { aside: ReactNode }) => {
  const [isLoading, setIsLoading] = useState(false);

  const initiateBankConnectionAsync = () => {
    const fetch = async () => {
      setIsLoading(true);
      const redirectionUrl = await bankProvider.initiateConnection();
      Redirect.toURL(redirectionUrl.redirectionUrl);
    };
    fetch().catch(printError);
  };

  return (
    <Card
      sx={{
        border: 'none',
        outline: 'none',
      }}
    >
      <CardContent style={CARD_CONTENT}>
        <Paper sx={NO_BANK_CARD}>
          <AccountBalanceIcon style={BALANCE_ICON as CSSProperties} />
          <Box sx={{ zIndex: 2, m: 5, '.MuiTypography-root': { fontSize: '1.3rem' } }}>
            <Typography component='div'>Aucune banque associée.</Typography>
            <Typography component='div' mt={15}>
              Cliquez{' '}
              <span
                data-testid='initiate-bank-connection-button'
                style={HERE_LINK}
                onClick={initiateBankConnectionAsync}
                onKeyDown={initiateBankConnectionAsync}
              >
                ici
              </span>{' '}
              pour associer une banque.
            </Typography>
          </Box>
        </Paper>
        <Backdrop open={isLoading} />
        <Modal open={isLoading}>
          <Backdrop open={isLoading} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1999 }}>
            <CircularProgress />
          </Backdrop>
        </Modal>
        {aside}
      </CardContent>
    </Card>
  );
};

const Bank: FC<{ account: Account; setAccount: Dispatch<SetStateAction<Account>>; aside: ReactNode }> = ({ account, setAccount, aside }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleCloseDialog = () => setIsDialogOpen(false);
  const handleOpenDialog = () => setIsDialogOpen(true);

  return (
    <>
      <BankDisconnection setAccount={setAccount} isOpen={isDialogOpen} onClose={handleCloseDialog} bank={account.bank} />
      <Card
        sx={{
          border: 'none',
          outline: 'none',
        }}
      >
        <CardHeader
          title='Ma banque'
          action={
            <Toolbar sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
              <Button
                data-testid='bank-disconnection-front-button'
                endIcon={<AccountBalanceIcon sx={{ mx: 1, transform: 'translateY(-2px)' }} />}
                onClick={handleOpenDialog}
              >
                Déconnecter ma banque
              </Button>
            </Toolbar>
          }
        />
        <CardContent style={CARD_CONTENT}>
          <Stack direction='row' spacing={2}>
            <Paper sx={BANK_CARD}>
              <img src={account.bank.logoUrl} style={BANK_LOGO as CSSProperties} alt='bank-logo' />
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
          {aside}
        </CardContent>
      </Card>
    </>
  );
};

const BankCardText: FC<{ title: string; label: string } & BoxProps> = ({ title, label, ...others }) => (
  <Box {...others}>
    <Typography component='div'>{title}</Typography>
    <Typography component='div' style={TEXT_MESSAGE as CSSProperties}>
      {label}
    </Typography>
  </Box>
);

const BankDisconnection: FC<{ isOpen: boolean; onClose: () => void; bank: BankType; setAccount: Dispatch<SetStateAction<Account>> }> = ({
  isOpen,
  onClose,
  bank,
  setAccount,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const notify = useNotify();
  const handleDisconnectBank = async () => {
    setIsLoading(true);
    const fetch = async () => {
      const newAccount = await bankProvider.endConnection();
      setAccount(newAccount);
      onClose();
      notify('messages.disconnection.success', { type: 'success' });
    };
    fetch()
      .catch(() => notify('messages.global.error', { type: 'error' }))
      .finally(() => setIsLoading(false));
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
        <Button disabled={isLoading} onClick={handleSubmit(handleDisconnectBank)} data-testid='bank-disconnection-button'>
          Déconnecter
        </Button>
        <Button disabled={isLoading} onClick={onClose}>
          Annuler
        </Button>
      </DialogActions>
    </Dialog>
  );
};
