import { AccountInvoiceRelaunchConf, InvoiceRelaunch } from 'bpartners-react-client';
import { accounts1 } from './account-api';

export const invoiceRelaunch1: AccountInvoiceRelaunchConf = {
  draftRelaunch: 10,
  unpaidRelaunch: 20,
  id: 'mock_id_invoice1',
};

export const invoiceRelaunch2: AccountInvoiceRelaunchConf = {
  draftRelaunch: 101,
  unpaidRelaunch: 201,
  id: 'mock_id_invoice2',
};

export const invoiceRelaunchHistory: InvoiceRelaunch = {
  accountId: accounts1[0].id,
  attachments: [{ content: '', fileId: 'dummy_attachement_id', name: 'Mock file' }],
  creationDatetime: new Date('2023-01-01'),
  id: 'invoice_relaunch_1',
  isUserRelaunched: true,
  type: 'CONFIRMED',
  emailInfo: {
    attachmentFileId: 'dummy_attachement_id',
    emailBody: '<p>Dummy body content of history relaunch</p>',
    emailObject: 'Dummy object of history relaunch',
  },
};
