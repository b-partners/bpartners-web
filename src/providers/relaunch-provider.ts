import { asyncGetAccountId, getCached, payingApi } from '.';

export const relaunchProvider = {
  async getConf() {
    const accountId = await asyncGetAccountId();
    return payingApi()
      .getAccountInvoiceRelaunchConf(accountId)
      .then(({ data }) => data);
  },
  async getList(page: number, perPage: number, filter: any = {}) {
    const { invoiceId } = filter;
    const { accountId } = getCached.userInfo();
    if (!invoiceId || invoiceId.length === 0) {
      return [];
    }
    const { data } = await payingApi().getRelaunches(accountId, invoiceId, page, perPage);
    return data;
  },
  updateConf: async function (resources: any): Promise<any> {
    const { accountId } = getCached.userInfo();
    return payingApi()
      .configureAccountInvoiceRelaunch(accountId, resources)
      .then(({ data }) => data);
  },
};
