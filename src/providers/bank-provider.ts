import { Account } from '@bpartners/typescript-client';
import { createRedirectionUrl } from '../common/utils';
import { userAccountsApi } from './api';
import { cache, getCached } from './cache';

export const bankProvider = {
  initiateConnection: async (): Promise<any> => {
    const { userId, accountId } = getCached.userInfo();
    const redirectionUrl = createRedirectionUrl('/bank', '/error');
    const { data } = await (userAccountsApi() as any)?.initiateBankConnection(userId, accountId, redirectionUrl);
    return data;
  },
  endConnection: async (): Promise<Account> => {
    const { userId } = getCached.userInfo();
    const { data: account } = await (userAccountsApi() as any)?.disconnectBank(userId);
    return cache.account({ ...account, bank: null });
  },
};
