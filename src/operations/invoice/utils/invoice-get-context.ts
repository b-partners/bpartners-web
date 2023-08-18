import { Invoice } from 'bpartners-react-client';

export const invoiceGetContext = (invoice: Invoice = {}, ifProposal: string, ifConfirmed: string) =>
  invoiceGetBaseContext(invoice, `${ifProposal} devis`, `${ifConfirmed} facture`);

export const invoiceGetBaseContext = (invoice: Invoice = {}, ifProposal: string, ifConfirmed: string) =>
  invoice?.status === 'PROPOSAL' ? ifProposal : ifConfirmed;
