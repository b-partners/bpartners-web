import { useContext } from 'react';
import { InvoiceContextState, InvoiceListContext, InvoiceTab, InvoiceView } from '../store';
import { Invoice } from 'bpartners-react-client';

export const useInvoiceContext = () => {
  const { state, dispatch } = useContext(InvoiceListContext);

  const setInvoice = (invoice: Invoice) => dispatch({ type: 'setInvoice', payload: invoice });
  const setTab = (tab: InvoiceTab) => dispatch({ type: 'setTab', payload: tab });
  const setDocumentUrl = (url: string) => dispatch({ type: 'setDocumentUrl', payload: url });
  const setView = (view: InvoiceView) => dispatch({ type: 'setView', payload: view });
  const setState = (state: InvoiceContextState) => dispatch({ type: 'set', payload: state });
  const increasePending = () => dispatch({ type: 'setPending', payload: state.updatePendingNumbers + 1 });
  const decreasePending = () => dispatch({ type: 'setPending', payload: state.updatePendingNumbers - 1 });

  return { setInvoice, setTab, setDocumentUrl, setView, setState, increasePending, decreasePending, state };
};
