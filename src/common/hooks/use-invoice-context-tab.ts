import { InvoiceTab } from '../store';
import { useInvoiceContext } from './use-invoice-context';

type TabResolver = {
  toNumber: Record<InvoiceTab, number>;
  toString: Record<number, InvoiceTab>;
};

export const InvoiceTabResolver: TabResolver = {
  toNumber: {
    draft: 0,
    proposal: 1,
    confirmed: 2,
  },
  toString: {
    0: 'draft',
    1: 'proposal',
    2: 'confirmed',
  },
};

export const useInvoiceContextTab = () => {
  const { state, setTab } = useInvoiceContext();

  const getNumberTab = (tab: InvoiceTab) => InvoiceTabResolver.toNumber[tab];
  const getStringTab = (tab: number) => InvoiceTabResolver.toString[tab];

  const handleSwitchTab = (_e: any, newTab: number) => setTab(getStringTab(newTab));

  return { current: getNumberTab(state.tab), handleSwitchTab, getNumberTab };
};
