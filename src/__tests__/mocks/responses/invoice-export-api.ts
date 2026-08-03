import { ArchiveStatus, InvoiceExportOutputFormat, InvoiceExportRequest, InvoiceStatus } from '@bpartners/typescript-client';

export const invoiceExportRequestPending: InvoiceExportRequest = {
  id: 'invoice-export-request-1',
  from: '2026-07-01',
  to: '2026-07-17',
  outputFormat: InvoiceExportOutputFormat.ZIP,
  batchSize: 100,
  statusList: [InvoiceStatus.CONFIRMED],
  archiveStatus: ArchiveStatus.ENABLED,
  totalInvoiceCount: 3,
  totalBatchCount: 2,
  batchList: [{ url: '/dummy-export/factures-1.zip', contentSize: 1024 }],
};

export const invoiceExportRequestPreparing: InvoiceExportRequest = {
  ...invoiceExportRequestPending,
  totalBatchCount: 0,
  batchList: [],
};

export const invoiceExportRequestReady: InvoiceExportRequest = {
  ...invoiceExportRequestPending,
  batchList: [
    { url: '/dummy-export/factures-1.zip', contentSize: 1024 },
    { url: '/dummy-export/factures-2.zip', contentSize: 2048 },
  ],
};

export const invoiceExportRequestEmpty: InvoiceExportRequest = {
  ...invoiceExportRequestPending,
  totalInvoiceCount: 0,
  totalBatchCount: 0,
  batchList: [],
};
