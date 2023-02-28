import { Invoice, InvoiceStatus } from 'bpartners-react-client';
import { TPaymentRegulation } from 'src/operations/invoice/utils';
import { customers1 } from './customer-api';
import { products } from './product-api';

const paymentRegulations: TPaymentRegulation[] = [{ amount: 0, comment: '', maturityDate: '', percent: 12 }];

export const createInvoices = (n: number, status: InvoiceStatus) => {
  const invoices: Invoice[] = [];
  for (let i = 0; i < n; i++) {
    invoices.push({
      customer: customers1[i < 2 ? 0 : i < 4 ? 1 : 2],
      fileId: 'file-id',
      id: 'invoice-id-' + i,
      paymentUrl: 'paymentUrl-' + i,
      products: [products[0], products[1]],
      ref: 'invoice-ref-' + i,
      sendingDate: '2022-05-10',
      toPayAt: '2022-05-15',
      validityDate: '2022-05-15',
      status: status,
      paymentType: 'CASH',
      paymentRegulations: [],
      title: 'invoice-title-' + i,
      totalPriceWithoutVat: 10000,
      totalPriceWithVat: 12000,
      paymentType: 'CASH',
      totalVat: 2000,
      metadata: {
        submittedAt: '2023-01-10T11:05:22.362Z',
      },
    });
  }
  return invoices;
};

export const invoiceWithoutCustomer = {
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
  metadata: {
    submittedAt: '2023-01-10T11:05:22.362Z',
  },
};

export const invoiceWithoutTitle = {
  customers: customers1[1],
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
