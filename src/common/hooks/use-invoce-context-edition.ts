import { useInvoiceContext } from './use-invoice-context';
import { invoiceInitialValue } from '../../operations/invoice/utils/utils';
import { v4 as uuid } from 'uuid';
import { Invoice, InvoiceStatus } from 'bpartners-react-client';

export const useInvoceContextEdition = () => {
  const { state, setState } = useInvoiceContext();
  const createInvoice = (status: InvoiceStatus) =>
    setState({
      ...state,
      invoice: { ...invoiceInitialValue, id: uuid(), status },
      view: 'creation',
    });
  const editInvoice = (invoice: Invoice) => setState({ ...state, invoice, view: 'edition' });
  const createDraftInvoice = () => createInvoice(InvoiceStatus.DRAFT);
  const createConfirmedInvoice = () => createInvoice(InvoiceStatus.CONFIRMED);

  return { createDraftInvoice, createConfirmedInvoice, editInvoice };
};
