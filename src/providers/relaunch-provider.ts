import { asyncGetAccountId, getCached, payingApi } from '.';

export const relaunchProvider = {
  async getConf() {
    const accountId = await asyncGetAccountId();
    return payingApi()
      .getAccountInvoiceRelaunchConf(accountId)
      .then(({ data }) => data);
  },
  updateConf: async function (resources: any): Promise<any> {
    const { accountId } = getCached.userInfo();
    return payingApi()
      .configureAccountInvoiceRelaunch(accountId, resources)
      .then(({ data }) => data);
  },
};
