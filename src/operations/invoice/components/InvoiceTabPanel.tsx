import TabPanel from 'src/common/components/TabPanel';
import InvoiceList from '../InvoiceList';
import { InvoiceTab } from 'src/common/store/invoice-store';
import { InvoiceStatus } from 'bpartners-react-client';
import { useInvoiceContextTab } from 'src/common/hooks';

type InvoiceTabPanelProps = {
  tabSource: InvoiceTab;
  invoiceTypes: InvoiceStatus[];
};

export const InvoiceTabPanel = (props: InvoiceTabPanelProps) => {
  const { invoiceTypes, tabSource } = props;
  const { current, handleSwitchTab, getNumberTab } = useInvoiceContextTab();

  return (
    <TabPanel value={current} index={getNumberTab(tabSource)} sx={{ padding: 0 }}>
      <InvoiceList invoiceTypes={invoiceTypes} handleSwitchTab={handleSwitchTab} />
    </TabPanel>
  );
};
