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
      globalDiscount: null,
      archiveStatus: 'ENABLED',
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
  globalDiscount: null,
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
  globalDiscount: null,
  metadata: {
    submittedAt: '2023-01-10T11:05:22.362Z',
  },
};

export const restInvoiceRegulation = [
  {
    paymentRequest: {
      id: '2c5d8d52-9708-45fe-b146-baf8820140af',
      amount: 5450,
      percentValue: 7000,
      payerName: 'Mahefa Ny Anjara',
      payerEmail: 'mahefa@gmail.com',
      label: 'BROUILLON-REF-2302281442 - Acompte N°1',
      reference: 'BROUILLON-REF-2302281442',
      initiatedDatetime: '2023-03-14T13:44:29.373132Z',
    },
    maturityDate: '2023-02-28',
  },
  {
    paymentRequest: {
      id: '9588e722-df06-4a04-8629-f3b5b32f819a',
      amount: 2336,
      percentValue: 3000,
      payerName: 'Mahefa Ny Anjara',
      payerEmail: 'mahefa@gmail.com',
      label: 'BROUILLON-REF-2302281442 - Restant dû',
      reference: 'BROUILLON-REF-2302281442',
      initiatedDatetime: '2023-03-14T13:44:29.471419Z',
    },
    maturityDate: '2023-03-14',
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

export const invoicesToChangeStatus = [
  {
    id: '927aa638-9676-436a-84a9-4a73d339b164',
    products: [
      {
        unitPriceWithVat: 120,
        totalVat: 20,
        totalPriceWithVat: 120,
        status: 'ENABLED',
        id: '74a56c10-2bb7-4553-affd-3baa017a9c1e',
        description: '1 EUR',
        quantity: 1,
        unitPrice: 100,
        vatPercent: 2000,
      },
    ],
    totalVat: 20,
    totalPriceWithoutDiscount: 100,
    totalPriceWithoutVat: 100,
    totalPriceWithVat: 120,
    status: 'DRAFT',
    createdAt: '2023-03-14T13:52:24.398594Z',
    updatedAt: '2023-03-14T13:52:30.905725Z',
    fileId: '9a6a928b-904a-4947-b1fc-b95653b08000',
    paymentRegulations: [
      {
        paymentRequest: {
          comment: 'Test dummy comment',
          id: '0ebb62d2-56e9-4798-a568-ec9e8a093d0a',
          amount: 36,
          percentValue: 3000,
          payerName: 'Mahefa Ny Anjara',
          payerEmail: 'mahefa@gmail.com',
          label: 'REF-2303141643 - Acompte N°1',
          reference: 'REF-2303141643',
          initiatedDatetime: '2023-03-14T13:52:34.264214Z',
        },
        maturityDate: '2023-03-14',
      },
      {
        paymentRequest: {
          id: '5b7aed9b-af44-42d4-95eb-42cd4b88e229',
          amount: 84,
          percentValue: 7000,
          payerName: 'Mahefa Ny Anjara',
          payerEmail: 'mahefa@gmail.com',
          label: 'REF-2303141643 - Restant dû',
          reference: 'REF-2303141643',
          initiatedDatetime: '2023-03-14T13:52:34.266515Z',
        },
        maturityDate: '2023-03-14',
      },
    ],
    ref: 'BROUILLON-REF-2303141643',
    title: 'Mon devis',
    customer: {
      id: '79c85ed1-a740-45da-8792-86a8c30024fc',
      firstName: 'Mahefa',
      lastName: 'Ny Anjara',
      email: 'mahefa@gmail.com',
      phone: '+33 06 12 34 56',
      website: 'mahefa.ny',
      address: '23 Rue Ivandry',
      city: 'Paris',
      country: 'France',
      comment: 'Coms',
    },
    paymentType: 'IN_INSTALMENT',
    sendingDate: '2023-03-13',
    validityDate: '2023-03-14',
    toPayAt: '2023-03-14',
    delayInPaymentAllowed: 30,
    delayPenaltyPercent: 500,
    metadata: { submittedAt: '2023-03-14T13:52:49.428Z' },
    globalDiscount: { percentValue: 0, amountValue: 0 },
  },
];
