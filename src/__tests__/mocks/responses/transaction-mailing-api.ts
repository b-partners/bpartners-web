import { CreateEmail, TransactionExportLink } from 'bpartners-react-client';

export const transactionExportLinkResponse: TransactionExportLink = {
  createdAt: new Date('2023-03-15'),
  expiredAt: new Date('2023-11-01'),
  downloadLink: 'dummy',
};
export const createEmailResponse: CreateEmail = {
  id: 'dummyId',
  recipients: ['dummy@gmail.com'],
  emailObject: 'dummy object',
  emailBody: 'dummy body message',
  attachments: [],
  status: 'SENT',
};
