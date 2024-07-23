import { invoiceMapper } from '@/operations/invoice/utils/invoice-utils';
import { ArchiveStatus } from '@bpartners/typescript-client';
import { asyncGetAccountId, getCached, payingApi } from '.';
import { BpDataProviderType } from './bp-data-provider-type';

export const invoiceProvider: BpDataProviderType = {
  getList: async function (page: number, perPage: number, filters = {}): Promise<any[]> {
    const { invoiceTypes, invoiceListSearch } = filters;

    const accountId = await asyncGetAccountId();
    const searchValues = ((invoiceListSearch as string) || '').split(' ');

    return (await payingApi().getInvoices(accountId, page, perPage, undefined, invoiceTypes, ArchiveStatus.ENABLED, undefined, searchValues)).data;
  },
  getOne: async function (invoiceId: string): Promise<any> {
    const { accountId } = getCached.userInfo();
    const { data: invoice } = await payingApi().getInvoiceById(accountId, invoiceId);
    return invoiceMapper.toDomain(invoice);
  },
  saveOrUpdate: async function (_invoices: any[], _option = {}): Promise<any[]> {
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

export const updatePaymentReg = async (invoiceId: string, paymentRegulation: any) => {
  const { accountId } = getCached.userInfo();
  const { paymentRequest, status } = paymentRegulation;
  return (
    await payingApi().updatePaymentRegMethod(accountId, invoiceId, paymentRequest?.id, {
      method: status?.paymentMethod,
    })
  ).data;
};
export const getInvoicesSummary = async () => {
  const { accountId } = getCached.userInfo();
  return (await payingApi().getInvoicesSummary(accountId)).data;
};
