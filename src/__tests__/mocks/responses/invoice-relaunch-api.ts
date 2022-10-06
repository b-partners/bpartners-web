import { InvoiceRelaunch, CreateInvoiceRelaunch } from 'src/gen/bpClient';

export const invoiceRelaunch1: InvoiceRelaunch = {
  draftRelaunch: 10,
  unpaidRelaunch: 20,
  createdDatetime: new Date(),
  id: 'mock_id_invoice1',
};

export const invoiceRelaunch2: InvoiceRelaunch = {
  draftRelaunch: 101,
  unpaidRelaunch: 201,
  createdDatetime: new Date(),
  id: 'mock_id_invoice2',
};
