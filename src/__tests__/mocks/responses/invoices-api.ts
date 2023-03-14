import { Invoice, InvoiceStatus } from 'bpartners-react-client';
import { customers1 } from './customer-api';
import { products } from './product-api';

export const createInvoices = (n: number, status: InvoiceStatus) => {
  const invoices: Invoice[] = [];
  for (let i = 0; i < n; i++) {
    invoices.push({
      customer: customers1[i < 2 ? 0 : i < 4 ? 1 : 2],
      fileId: 'file-id',
      id: `invoice-${status}-${i}-id`,
      paymentUrl: 'paymentUrl-' + i,
      products: [products[0], products[1]],
      ref: 'invoice-ref-' + i,
      sendingDate: '2022-05-10',
      toPayAt: '2022-05-15',
      validityDate: '2022-05-15',
      status: status,
      paymentRegulations: null,
      title: 'invoice-title-' + i,
      totalPriceWithoutVat: 10000,
      totalPriceWithVat: 12000,
      totalVat: 2000,
      paymentType: 'CASH',
      globalDiscount: {
        percentValue: 1000,
        amountValue: null,
      },
      metadata: {
        submittedAt: '2023-01-10T11:05:22.362Z',
      },
    });
  }
  return invoices;
};

export const invoiceWithoutCustomer: Invoice = {
  fileId: 'file-incomplete-id',
  id: 'invoice-incomplete-id',
  paymentUrl: 'paymentUrl',
  products: [products[0], products[1]],
  ref: 'invoice-incomplete-ref',
  sendingDate: '2022-05-10',
  toPayAt: '2022-05-15',
  validityDate: '2022-05-10',
  status: 'DRAFT',
  title: 'invoice-incomplete-title',
  totalPriceWithoutVat: 10000,
  totalPriceWithVat: 12000,
  totalVat: 2000,
  paymentType: 'CASH',
  globalDiscount: {
    percentValue: 1000,
    amountValue: null,
  },
  metadata: {
    submittedAt: '2023-01-10T11:05:22.362Z',
  },
};

export const invoiceWithoutTitle: Invoice = {
  customer: customers1[1],
  fileId: 'file-incomplete-id',
  id: 'invoice-incomplete-id',
  paymentUrl: 'paymentUrl',
  products: [products[0], products[1]],
  ref: 'invoice-incomplete-ref',
  sendingDate: '2022-05-10',
  toPayAt: '2022-05-15',
  validityDate: '2022-05-15',
  status: 'DRAFT',
  title: '',
  totalPriceWithoutVat: 10000,
  totalPriceWithVat: 12000,
  totalVat: 2000,
  paymentType: 'CASH',
  globalDiscount: {
    percentValue: 1000,
    amountValue: null,
  },
  metadata: {
    submittedAt: '2023-01-10T11:05:22.362Z',
  },
};

export const restInvoiceRegulation = [
  {
    maturityDate: '2023-02-22',
    paymentRequest: {
      id: 'string',
      paymentUrl: 'string',
      amount: 10,
      payerName: 'string',
      payerEmail: 'string',
      label: 'string',
      reference: 'string',
      initiatedDatetime: '2023-02-22T11:51:41.097Z',
    },
  },
  {
    maturityDate: '2023-02-22',
    paymentRequest: {
      id: 'string',
      paymentUrl: 'string',
      amount: 90,
      payerName: 'string',
      payerEmail: 'string',
      label: 'string',
      reference: 'string',
      initiatedDatetime: '2023-02-22T11:51:41.097Z',
    },
  },
];

const invoiceMock = {
  ACCEPTED: createInvoices(35, InvoiceStatus.ACCEPTED),
  CONFIRMED: createInvoices(35, InvoiceStatus.CONFIRMED),
  DRAFT: createInvoices(35, InvoiceStatus.DRAFT),
  PAID: createInvoices(35, InvoiceStatus.PAID),
  PROPOSAL: createInvoices(35, InvoiceStatus.PROPOSAL),
  PROPOSAL_CONFIRMED: createInvoices(35, InvoiceStatus.PROPOSAL_CONFIRMED),
};

export const getInvoices = (page: number, perPage: number, status: InvoiceStatus) => invoiceMock[status].slice(page * perPage, page * perPage + perPage);
