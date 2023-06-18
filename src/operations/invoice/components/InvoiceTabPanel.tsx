import TabPanel from 'src/common/components/TabPanel';
import InvoiceList from '../InvoiceList';
import { InvoiceToolState, useInvoiceToolContext } from 'src/common/store/invoice';
import { InvoiceStatus } from 'bpartners-react-client';

const TAB_PANEL_STYLE = { padding: 0 };

type InvoiceTabPanelProps = {
  index: InvoiceToolState['tab'];
  type: InvoiceStatus[];
  onStateChange: any;
};

export const InvoiceTabPanel = (props: InvoiceTabPanelProps) => {
  const { index, onStateChange, type } = props;
  const { tab } = useInvoiceToolContext();

  return (
    <TabPanel value={tab} index={index} sx={TAB_PANEL_STYLE}>
      <InvoiceList onStateChange={onStateChange} invoiceTypes={type} />
    </TabPanel>
  );
};
