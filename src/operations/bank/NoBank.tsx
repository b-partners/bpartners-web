import { Redirect, printError } from '@/common/utils';
import { bankProvider } from '@/providers';
import { AccountBalance as AccountBalanceIcon } from '@mui/icons-material';
import { Backdrop, Box, Card, CardContent, CircularProgress, Modal, Paper, Typography } from '@mui/material';
import { FC, useState } from 'react';
import { NO_BANK_PAGE_CARD } from './style';
import { NoBankProps } from './types';

export const NoBank: FC<NoBankProps> = ({ aside }) => {
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
    <Card sx={NO_BANK_PAGE_CARD}>
      <CardContent>
        <Paper>
          <AccountBalanceIcon />
          <Box>
            <Typography component='div'>Aucune banque associée.</Typography>
            <Typography component='div' mt={15}>
              Cliquez{' '}
              <a data-testid='initiate-bank-connection-button' onClick={initiateBankConnectionAsync} href='#'>
                ici
              </a>{' '}
              pour associer une banque.
            </Typography>
          </Box>
        </Paper>
        <Backdrop open={isLoading} />
        <Modal open={isLoading}>
          <Backdrop open={isLoading}>
            <CircularProgress />
          </Backdrop>
        </Modal>
        {aside}
      </CardContent>
    </Card>
  );
};
