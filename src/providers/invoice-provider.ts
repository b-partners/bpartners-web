import { invoiceMapper } from '@/operations/invoice/utils/invoice-utils';
import { ArchiveStatus, InvoiceExportOutputFormat, InvoiceExportRequest, InvoiceStatus } from '@bpartners/typescript-client';
import { v4 as uuid } from 'uuid';
import { asyncGetAccountId, asyncGetUserInfo, getCached, payingApi } from '.';
import { BpDataProviderType } from './bp-data-provider-type';

export const invoiceProvider: BpDataProviderType = {
  getList: async function (page: number, perPage: number, filters = {}): Promise<any[]> {
    const { invoiceTypes, invoiceListSearch } = filters;

    const accountId = await asyncGetAccountId();
    const searchValues = ((invoiceListSearch as string) || '').split(' ');
    const mappedInvoiceTypes = `${invoiceTypes.join(',')}`;

    return (await payingApi().getInvoices(accountId, page, perPage, undefined, mappedInvoiceTypes, ArchiveStatus.ENABLED, undefined, searchValues)).data;
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
  const { accountId } = await asyncGetUserInfo();
  return (await payingApi().getInvoicesSummary(accountId || '')).data;
};

export type InvoicesExportParams = {
  statuses: InvoiceStatus[];
  archiveStatus: ArchiveStatus;
  batchSize: number;
  from: string;
  to: string;
};

export const submitInvoicesExportRequest = async ({ statuses, archiveStatus, batchSize, from, to }: InvoicesExportParams) => {
  const { userId } = await asyncGetUserInfo();
  const requestId = uuid();

  await payingApi().submitInvoiceExportRequest(userId, [
    {
      id: requestId,
      from,
      to,
      batchSize,
      statusList: statuses,
      archiveStatus,
      outputFormat: InvoiceExportOutputFormat.ZIP,
    },
  ]);

  return requestId;
};

export const retrieveInvoicesExportRequest = async (requestId: string) => {
  const { userId } = await asyncGetUserInfo();
  return (await payingApi().retrieveInvoiceExportRequest(userId, requestId)).data;
};

export const getExportReadyBatches = (exportRequest?: InvoiceExportRequest) => (exportRequest?.batchList || []).filter(({ url }) => !!url);

export const isExportRequestEmpty = (exportRequest?: InvoiceExportRequest) => exportRequest?.totalInvoiceCount === 0;

export const isExportRequestReady = (exportRequest?: InvoiceExportRequest) => {
  const { totalBatchCount } = exportRequest || {};
  if (!totalBatchCount) return false;
  return getExportReadyBatches(exportRequest).length >= totalBatchCount;
};

export const isExportRequestSettled = (exportRequest?: InvoiceExportRequest) => isExportRequestEmpty(exportRequest) || isExportRequestReady(exportRequest);

export const downloadExportBatches = (exportRequest: InvoiceExportRequest) =>
  getExportReadyBatches(exportRequest).forEach(({ url }, index) => {
    const link = document.createElement('a');
    link.href = url as string;
    link.download = `factures-${exportRequest.from}-${exportRequest.to}-${index + 1}.zip`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  });
