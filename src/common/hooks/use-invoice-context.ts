import { useContext } from 'react';
import { InvoiceContextState, InvoiceListContext, InvoiceModal, InvoiceTab, InvoiceView } from '../store';
import { Invoice } from 'bpartners-react-client';
import { getInvoicePdfUrl, invoiceInitialValue } from 'src/operations/invoice/utils/utils';

export const useInvoiceContext = () => {
  const { state, dispatch } = useContext(InvoiceListContext);

  const setInvoice = (invoice: Invoice) => dispatch({ type: 'setInvoice', payload: invoice });
  const editInvoice = (invoice: Invoice) => dispatch({ type: 'set', payload: { ...state, invoice, view: 'edition', documentUrl: getInvoicePdfUrl(invoice.fileId) } });
  const createInvoice = () => dispatch({ type: 'set', payload: { ...state, invoice: invoiceInitialValue, view: 'creation' } });
  const setTab = (tab: InvoiceTab) => dispatch({ type: 'setTab', payload: tab });
  const setDocumentUrl = (url: string) => dispatch({ type: 'set', payload: { ...state, documentUrl: url, view: 'preview' } });
  const setView = (view: InvoiceView) => dispatch({ type: 'setView', payload: view });
  const setState = (state: InvoiceContextState) => dispatch({ type: 'set', payload: state });
  const increasePending = () => dispatch({ type: 'setPending', payload: state.updatePendingNumbers + 1 });
  const decreasePending = () => dispatch({ type: 'setPending', payload: state.updatePendingNumbers - 1 });
  const setInvoiceModal = (modal: InvoiceModal, invoice: Invoice) => dispatch({ type: 'setPending', payload: { modal, invoice } });

  return { setInvoice, setTab, setDocumentUrl, setView, setState, increasePending, decreasePending, state, editInvoice, createInvoice, setInvoiceModal };
};
