import { InvoiceStatus } from 'bpartners-react-client';
import { invoiceMapper } from 'src/operations/invoice/utils/invoice-utils';
import { asyncGetAccountId, getCached, payingApi } from '.';
import { BpDataProviderType } from './bp-data-provider-type';

export const invoiceProvider: BpDataProviderType = {
  getList: async function (page: number, perPage: number, filter: any): Promise<any[]> {
    const accountId = await asyncGetAccountId();
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
  saveOrUpdate: async function (_invoices: any[], option = {}): Promise<any[]> {
    const { isEdition } = option;
    const { accountId } = getCached.userInfo();
    const restInvoice = isEdition ? invoiceMapper.toRest({ ..._invoices[0] }) : invoiceMapper.toRest(invoiceMapper.toDomain({ ..._invoices[0] }));

    return payingApi()
      .crupdateInvoice(accountId, restInvoice.id, restInvoice)
      .then(({ data }) => [data]);
  },
};
