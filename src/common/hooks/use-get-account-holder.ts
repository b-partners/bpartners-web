import { AccountHolder } from 'bpartners-react-client';
import { useEffect, useState } from 'react';
import { accountHoldersGetter } from 'src/providers/account-provider';

const useGetAccountHolder = (): AccountHolder => {
  const [accountHodler, setAccountHolder] = useState<AccountHolder>({});

  useEffect(() => {
    const getAH = async () => {
      const aH = await accountHoldersGetter();
      setAccountHolder(aH);
    };
    getAH();
  }, []);

  return accountHodler;
};

export default useGetAccountHolder;
