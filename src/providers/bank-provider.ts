import { Account, BankConnectionRedirection } from '@bpartners/typescript-client';
import { cache, getCached } from './cache';
import { createRedirectionUrl } from '../common/utils';
import { userAccountsApi } from './api';

export const bankProvider = {
  initiateConnection: async (): Promise<BankConnectionRedirection> => {
    const { userId, accountId } = getCached.userInfo();
    const redirectionUrl = createRedirectionUrl('/bank', '/error');
    const { data } = await userAccountsApi().initiateBankConnection(userId, accountId, redirectionUrl);
    return data;
  },
  endConnection: async (): Promise<Account> => {
    const { userId } = getCached.userInfo();
    const { data: account } = await userAccountsApi().disconnectBank(userId);
    return cache.account({ ...account, bank: null });
  },
};
