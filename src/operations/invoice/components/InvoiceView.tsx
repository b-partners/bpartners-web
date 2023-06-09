import { ReactNode } from 'react';
import { useInvoiceContext } from 'src/common/hooks/use-invoice-context';
import { InvoiceView as InvoiceViewType } from 'src/common/store/invoice-store';

type TViewProps = {
  children: ReactNode;
  source?: InvoiceViewType;
  sources?: InvoiceViewType[];
};
export const InvoiceView = ({ children, source, sources = [] }: TViewProps) => {
  const { state } = useInvoiceContext();
  return state.view === source || sources.includes(state.view) ? children : <div style={{ display: 'none' }}></div>;
};
