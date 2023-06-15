import { ReactNode, useReducer } from 'react';
import { InvoiceListContext, invoiceReducer } from 'src/common/store';

type TInvoiceContextProvider = {
  children: ReactNode;
};

export const InvoiceContextProvider = ({ children }: TInvoiceContextProvider) => {
  const [state, dispatch] = useReducer(
    invoiceReducer,
    {
      invoice: null,
      updatePendingNumbers: 0,
      documentUrl: null,
      tab: 'draft',
      view: 'list',
    },
    state => state
  );
  return <InvoiceListContext.Provider value={{ state, dispatch }}>{children}</InvoiceListContext.Provider>;
};
