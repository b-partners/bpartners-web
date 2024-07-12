import { useInvoiceToolContext } from '@/common/store/invoice';
import { Tab, Tabs } from '@mui/material';

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
