import { AccountHolder } from '@bpartners/typescript-client';
import { useEffect, useState } from 'react';
import { accountHolderProvider, getCached } from '../../providers';
import { printError } from '../utils';

const useGetAccountHolder = (): AccountHolder => {
  const [accountHolder, setAccountHolder] = useState<AccountHolder>({});

  useEffect(() => {
    const getAH = async () => {
      const cached = getCached.accountHolder();
      if (cached && cached.id) {
        setAccountHolder(cached);
      } else {
        const aH = await accountHolderProvider.getOne();
        setAccountHolder(aH);
      }
    };
    getAH().catch(printError);
  }, []);

  return accountHolder;
};

export default useGetAccountHolder;
