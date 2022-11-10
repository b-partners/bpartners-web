import authProvider from './auth-provider';
import { BpDataProviderType } from './bp-data-provider-type';
import { payingApi } from './api';
import { singleAccountGetter } from './account-provider';
import { v4 as uuid } from 'uuid';
import { InvoiceStatus } from 'src/gen/bpClient';

export const getUserInfo = async (): Promise<{ accountId: string; userId: string }> => {
  const userId = authProvider.getCachedWhoami().user.id;
  const accountId = (await singleAccountGetter(userId)).id;
  return { userId, accountId };
};

export const invoiceProvider: BpDataProviderType = {
  getList: async function (page: number, perPage: number, filter: any): Promise<any[]> {
    const { accountId } = await getUserInfo();
    const invoiceType: InvoiceStatus = filter.invoiceType;

    return payingApi()
      .getInvoices(accountId, page, perPage, invoiceType)
      .then(({ data }) => data);
  },
  getOne: function (id: string): Promise<any> {
    throw new Error('Function not implemented.');
  },
  saveOrUpdate: async function (invoices: any[]): Promise<any[]> {
    const iId = invoices[0].id.length === 0 ? uuid() : invoices[0].id;
    const { accountId } = await getUserInfo();
    return payingApi()
      .crupdateInvoice(invoices[0], accountId, iId)
      .then(({ data }) => [data]);
  },
};

export default invoiceProvider;
