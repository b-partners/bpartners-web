import { singleAccountGetter } from './account-provider';
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
      .getInvoiceRelaunchConf(accountId)
      .then(({ data }) => data);
  },
  updateConf: async function (resources: any): Promise<any> {
    const { accountId } = await getUserInfo();
    return payingApi()
      .configureRelaunch(resources, accountId)
      .then(({ data }) => data);
  },
};

export default relaunchProvider;
