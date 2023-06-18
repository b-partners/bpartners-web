import { ArchiveStatus, InvoiceStatus } from 'bpartners-react-client';
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
      // Filter for disabled invoice
      invoiceTypes.map(invoiceType =>
        payingApi()
          .getInvoices(accountId, page, perPage, invoiceType)
          .then(({ data }) => data.filter(invoice => !invoice.archiveStatus || invoice.archiveStatus === ArchiveStatus.ENABLED))
      )
    ).then(listOfLists => listOfLists.flat());
  },
  getOne: async function (invoiceId: string): Promise<any> {
    const { accountId } = getCached.userInfo();
    const { data: invoice } = await payingApi().getInvoiceById(accountId, invoiceId);
    return invoiceMapper.toDomain(invoice);
  },
  saveOrUpdate: async function (_invoices: any[], option = {}): Promise<any[]> {
    const { accountId } = getCached.userInfo();
    const restInvoice = invoiceMapper.toRest({ ..._invoices[0] });

    return payingApi()
      .crupdateInvoice(accountId, restInvoice.id, restInvoice)
      .then(({ data }) => [data]);
  },
  archive: async (resources: any[]) => {
    const { accountId } = getCached.userInfo();
    return (await payingApi().archiveInvoices(accountId, resources)).data;
  },
};
