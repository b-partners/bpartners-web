import { Invoice } from 'bpartners-react-client';
import { createContext } from 'react';

type TInvoiceToolTipContext = {
  invoice: Invoice | null;
  onRelaunch: (e: ClipboardEvent) => void;
  onViewPdf: (e: ClipboardEvent) => void;
};
export const InvoiceTooltipContext = createContext<TInvoiceToolTipContext>({
  invoice: null,
  onRelaunch: _e => {},
  onViewPdf: _e => {},
});
