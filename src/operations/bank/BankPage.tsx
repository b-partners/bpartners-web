import { printError } from '@/common/utils';
import { accountProvider, getCached } from '@/providers';
import { useEffect, useState } from 'react';
import AccountConfig from './AccountConfig';
import { Bank } from './Bank';
import { NoBank } from './NoBank';

export const BankPage = () => {
  const [account, setAccount] = useState(getCached.account());

  useEffect(() => {
    const updateAccount = async () => {
      const currentAccount = await accountProvider.getOne();
      setAccount(currentAccount);
    };
    updateAccount().catch(printError);
  }, []);

  return account?.bank ? (
    <Bank aside={<AccountConfig setAccount={setAccount} />} account={account} setAccount={setAccount} />
  ) : (
    <NoBank aside={<AccountConfig setAccount={setAccount} />} />
  );
};
