import { useInvoiceToolContext } from '@/common/store/invoice';
import { Tab, Tabs } from '@mui/material';

export const InvoiceTabs = () => {
  const { tab, setTab } = useInvoiceToolContext();

  return (
    <Tabs value={tab} onChange={setTab} variant='fullWidth'>
      <Tab data-testid='invoice-tabs-brouillons' label='Brouillons' />
      <Tab data-testid='invoice-tabs-devis' label='Devis' />
      <Tab data-testid='invoice-tabs-facture' label='Factures' />
    </Tabs>
  );
};
