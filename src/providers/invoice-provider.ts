import authProvider from './auth-provider';
import { BpDataProviderType } from './bp-data-provider-type';
import { payingApi } from './api';
import { singleAccountGetter } from './account-provider';
import { InvoiceStatus } from 'bpartners-react-client';
import { invoiceMapper } from 'src/operations/invoice/utils/invoice-utils';

export const getUserInfo = async (): Promise<{ accountId: string; userId: string }> => {
  const userId = authProvider.getCachedWhoami().user.id;
  const accountId: any = (await singleAccountGetter(userId)).id;
  return { userId, accountId };
};

export const invoiceProvider: BpDataProviderType = {
  getList: async function (page: number, perPage: number, filter: any): Promise<any[]> {
    const { accountId } = await getUserInfo();
    const invoiceTypes: Array<InvoiceStatus> = filter.invoiceTypes;

    return Promise.all(
      // TODO: this has to be done backend-side.
      // In particular, front-end side pagination is at best inefficient, and at worst broken (case here).
      invoiceTypes.map(invoiceType =>
        payingApi()
          .getInvoices(accountId, page, perPage, invoiceType)
          .then(({ data }) => data)
      )
    ).then(listOfLists => listOfLists.flat());
  },
  getOne: function (_id: string): Promise<any> {
    throw new Error('Function not implemented.');
  },
  saveOrUpdate: async function (_invoices: any[]): Promise<any[]> {
    const { accountId } = await getUserInfo();
    const restInvoice = invoiceMapper.toRest({ ..._invoices[0] });

    return payingApi()
      .crupdateInvoice(accountId, restInvoice.id, restInvoice)
      .then(({ data }) => [data]);
  },
};

export default invoiceProvider;
