import { useInvoiceToolContext } from 'src/common/store/invoice';
import { Tabs, Tab } from '@mui/material';

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
