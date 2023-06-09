import { useInvoiceContext } from './use-invoice-context';
import { Invoice, InvoiceStatus } from 'bpartners-react-client';
import { InvoiceTab } from '../store';
import { invoiceProvider } from '../../providers';
import { retryOnError } from '../utils';
import { getInvoicePdfUrl } from '../../operations/invoice/utils/utils';
import { AxiosError } from 'axios';

type InvoiceMessages = {
  success: 'string';
  error: 'string';
};

export const useInvoiceContextRequest = () => {
  const { state, setInvoice, setState, setTab, setDocumentUrl, decreasePending, increasePending } = useInvoiceContext();
  const changeInvoiceStatus = async (invoice: Invoice, status: InvoiceStatus, tab?: InvoiceTab) => {
    await invoiceProvider.saveOrUpdate([{ ...invoice, status }]);
    if (tab) setTab(tab);
  };

  const retryInvoice = (invoice: Invoice, submittedAt: Date) => (error: AxiosError) =>
    error.response.status === 429 && (!invoice.metadata || submittedAt > new Date(invoice.metadata.submittedAt));

  const updateInvoice = async (invoice: Invoice) => {
    const [updatedInvoice] = await invoiceProvider.saveOrUpdate([invoice]);
    const documentUrl = getInvoicePdfUrl(updatedInvoice.fileId);
    setState({ ...state, documentUrl, updatePendingNumbers: state.updatePendingNumbers - 1 });
  };

  const saveOrUpdateInvoice = async (invoice: Invoice) => {
    state.updatePendingNumbers === 0 && increasePending();
    const submittedAt = new Date();
    await retryOnError(() => updateInvoice(invoice), retryInvoice(invoice, submittedAt));
  };

  const convertToProposal = async (invoice: Invoice) => await changeInvoiceStatus(invoice, InvoiceStatus.PROPOSAL, 'proposal');
  const convertToConfirmed = async (invoice: Invoice) => await changeInvoiceStatus(invoice, InvoiceStatus.CONFIRMED, 'confirmed');
  const convertToPaid = async (invoice: Invoice) => await changeInvoiceStatus(invoice, InvoiceStatus.PAID);

  return { convertToProposal, convertToConfirmed, convertToPaid, saveOrUpdateInvoice };
};
