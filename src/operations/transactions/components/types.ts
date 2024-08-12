import { TRANSACTION_STATUSES } from '@/constants';
import { Invoice, Transaction } from '@bpartners/typescript-client';

export interface StatusFieldProps {
  status: keyof typeof TRANSACTION_STATUSES;
}

export interface ExportLinkMailModalProps {
  isOpenModal: boolean;
  handleExportLinkMailModal: () => void;
}

export interface GenerateLinkModalProps {
  isOpenModal: boolean;
  handleGenerateLinkModal: () => void;
  handleExportLinkMailModal: () => void;
}

export interface SelectedInvoiceTableProps {
  invoice: Invoice;
}

export interface SelectionDialogProps {
  transaction: Transaction;
}

export interface TransactionLinkInvoiceProps {
  transaction: Transaction;
}
