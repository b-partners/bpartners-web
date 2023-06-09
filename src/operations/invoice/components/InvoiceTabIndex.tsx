import { Tabs, Tab } from '@mui/material';
import { useInvoiceContextTab } from 'src/common/hooks';

export const InvoiceTabIndex = () => {
  const { current, handleSwitchTab } = useInvoiceContextTab();

  return (
    <Tabs value={current} onChange={handleSwitchTab} variant='fullWidth'>
      <Tab label='Brouillons' />
      <Tab label='Devis' />
      <Tab label='Factures' />
    </Tabs>
  );
};
