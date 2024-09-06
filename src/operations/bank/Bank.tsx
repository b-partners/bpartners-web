import { useDialog } from '@/common/store/dialog';
import { AccountBalance as AccountBalanceIcon } from '@mui/icons-material';
import { Button, Card, CardContent, CardHeader, Paper, Stack, Toolbar, Typography } from '@mui/material';
import { FC } from 'react';
import { BankCardText } from './BankCardText';
import { BankDisconnection } from './BankDisconnectionDialog';
import { BankInformationForm } from './BankInformationForm';
import { BANK_PAGE_CARD } from './style';
import { BankProps } from './types';

export const Bank: FC<BankProps> = ({ account, setAccount, aside }) => {
  const { open } = useDialog();

  const handleOpenDialog = () => open(<BankDisconnection setAccount={setAccount} bank={account.bank} />);

  return (
    <Card sx={BANK_PAGE_CARD}>
      <CardHeader
        title='Ma banque'
        action={
          <Toolbar>
            <Button data-testid='bank-disconnection-front-button' endIcon={<AccountBalanceIcon />} onClick={handleOpenDialog}>
              Déconnecter ma banque
            </Button>
          </Toolbar>
        }
      />
      <CardContent>
        <Stack direction='row' spacing={2}>
          <Paper>
            <img src={account.bank.logoUrl} alt='bank-logo' />
            <Typography mt={1} variant='h4'>
              {account.bank.name}
            </Typography>
            <Stack>
              <BankCardText label={account.name} title='Nom du compte' />
              <BankCardText label={account.bic} title='BIC' />
              <BankCardText label={account.iban} title='IBAN' />
            </Stack>
          </Paper>
          <BankInformationForm setAccount={setAccount} account={account} />
        </Stack>
        {aside}
      </CardContent>
    </Card>
  );
};
