import { Tab, Tabs } from '@mui/material';
import { useInvoiceToolContext } from 'src/common/store/invoice';

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
