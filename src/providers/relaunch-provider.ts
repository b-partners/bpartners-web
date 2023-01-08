import { singleAccountGetter } from './account-provider';
import { payingApi } from './api';
import authProvider from './auth-provider';

const getUserInfo = async (): Promise<{ accountId: string; userId: string }> => {
  const userId = authProvider.getCachedWhoami().user.id;
  const accountId = (await singleAccountGetter(userId)).id;
  return { userId, accountId };
};

const relaunchProvider = {
  async getConf() {
    const { accountId } = await getUserInfo();
    return payingApi()
      .getAccountInvoiceRelaunchConf(accountId)
      .then(({ data }) => data);
  },
  updateConf: async function (resources: any): Promise<any> {
    const { accountId } = await getUserInfo();
    return payingApi()
      .configureAccountInvoiceRelaunch(accountId, resources)
      .then(({ data }) => data);
  },
};

export default relaunchProvider;
