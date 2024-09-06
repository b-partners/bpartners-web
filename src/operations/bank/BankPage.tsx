import { useBankDisconnection } from '@/common/store';
import { printError } from '@/common/utils';
import { accountProvider, getCached } from '@/providers';
import { CircularProgress, Container, Stack, Typography } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import AccountConfig from './AccountConfig';
import { Bank } from './Bank';
import { NoBank } from './NoBank';
import { BANK_DISCONNECTION_WAITER_PAGE } from './style';

export const BankPage = () => {
  const [account, setAccount] = useState(getCached.account());
  const { isInDisconnection, setIsInDisconnection } = useBankDisconnection();
  const ref = useRef<NodeJS.Timeout>(null);

  useEffect(() => {
    const bankDisconnectionTime = getCached.bankReconnectionTime();
    if (bankDisconnectionTime && new Date().getTime() < +bankDisconnectionTime && !isInDisconnection) {
      setIsInDisconnection(true);
    }
    if (!ref.current) {
      ref.current = setInterval(() => {
        if (!bankDisconnectionTime || new Date().getTime() > +bankDisconnectionTime) {
          setIsInDisconnection(false);
          clearInterval(ref.current);
          ref.current = null;
          return;
        }
        if (!isInDisconnection) {
          setIsInDisconnection(true);
        }
      }, 30000);
    }
  }, []);

  useEffect(() => {
    const updateAccount = async () => {
      const currentAccount = await accountProvider.getOne();
      setAccount(currentAccount);
    };
    updateAccount().catch(printError);
  }, []);

  if (isInDisconnection) {
    return (
      <Container sx={BANK_DISCONNECTION_WAITER_PAGE}>
        <Stack spacing={2}>
          <Typography>Veuillez patienter le temps de déconnecter votre banque</Typography>
          <CircularProgress />
        </Stack>
      </Container>
    );
  }

  return account?.bank ? (
    <Bank aside={<AccountConfig setAccount={setAccount} />} account={account} setAccount={setAccount} />
  ) : (
    <NoBank aside={<AccountConfig setAccount={setAccount} />} />
  );
};
