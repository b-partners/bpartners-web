import { InvoiceStatus } from '@bpartners/typescript-client';
import { ReactNode } from 'react';
import TabPanel from 'src/common/components/TabPanel';
import { InvoiceToolState, useInvoiceToolContext } from 'src/common/store/invoice';
import InvoiceList from '../InvoiceList';

const TAB_PANEL_STYLE = { padding: 0 };

type InvoiceTabPanelProps = {
  index: InvoiceToolState['tab'];
  type: InvoiceStatus[];
  onStateChange: any;
  actions?: ReactNode;
  emptyAction?: ReactNode;
};

export const InvoiceTabPanel = (props: InvoiceTabPanelProps) => {
  const { index, onStateChange, type, actions, emptyAction } = props;
  const { tab } = useInvoiceToolContext();

  return (
    <TabPanel value={tab} index={index} sx={TAB_PANEL_STYLE}>
      <InvoiceList onStateChange={onStateChange} emptyAction={emptyAction} invoiceTypes={type} actions={actions} />
    </TabPanel>
  );
};
