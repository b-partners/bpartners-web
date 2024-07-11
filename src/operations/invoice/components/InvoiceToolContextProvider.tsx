import { ReactElement, useState } from 'react';
import { InvoiceToolContext, InvoiceToolState } from '@/common/store/invoice';

type InvoiceToolContextProviderProps = {
  children: ReactElement;
};

export const InvoiceToolContextProvider = ({ children }: InvoiceToolContextProviderProps) => {
  const [state, setState] = useState<InvoiceToolState>({
    modal: {
      isOpen: false,
      type: 'FEEDBACK',
      invoice: null,
    },
    tab: 0,
    view: 'list',
  });

  return <InvoiceToolContext.Provider value={{ ...state, setState }}>{children}</InvoiceToolContext.Provider>;
};
