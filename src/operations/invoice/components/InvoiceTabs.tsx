import { Tab, Tabs } from '@mui/material';
import { useInvoiceToolContext } from '@/common/store/invoice';

export const InvoiceTabs = () => {
  const { tab, setTab } = useInvoiceToolContext();

  return (
    <Tabs value={tab} onChange={setTab} variant='fullWidth'>
      <Tab label='Brouillons' />
      <Tab label='Devis' />
      <Tab label='Factures' />
    </Tabs>
  );
};
