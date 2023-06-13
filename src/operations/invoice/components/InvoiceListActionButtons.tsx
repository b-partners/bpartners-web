import { Invoice, InvoiceStatus } from 'bpartners-react-client';
import { Box } from '@mui/material';
import { useInvoiceContext } from '../../../common/hooks';
import { InvoiceTooltip } from './InvoiceTooltipButton';
import { createContext } from 'react';
import { stopPropagation } from 'src/common/utils';

const LIST_ACTION_STYLE = { display: 'flex' };
type InvoiceListActionButtonsProps = {
  invoice: Invoice;
  setInvoiceToRelaunch: any;
};

type TInvoiceToolTipContext = {
  invoice: Invoice | null;
  onRelaunch: (e: ClipboardEvent) => void;
  onViewPdf: (e: ClipboardEvent) => void;
};
export const InvoiceTooltipContext = createContext<TInvoiceToolTipContext>({
  invoice: null,
  onRelaunch: _e => {},
  onViewPdf: _e => {},
});

export const InvoiceListActionButtons = ({ invoice, setInvoiceToRelaunch }: InvoiceListActionButtonsProps) => {
  const { setDocumentUrl } = useInvoiceContext();

  const onViewPdf = stopPropagation(() => setDocumentUrl(invoice.fileId));
  const onRelaunch = stopPropagation(() => setInvoiceToRelaunch(invoice));

  return (
    <Box sx={LIST_ACTION_STYLE}>
      <InvoiceTooltipContext.Provider value={{ invoice, onRelaunch, onViewPdf }}>
        <InvoiceTooltip type='toDocument' />
        <InvoiceTooltip type='toProposal' />
        <InvoiceTooltip type='toConfirmed' />
        <InvoiceTooltip type='toRelaunch' status={[InvoiceStatus.PROPOSAL]} />
        <InvoiceTooltip type='toPaid' />
        <InvoiceTooltip type='toRelaunch' status={[InvoiceStatus.ACCEPTED, InvoiceStatus.CONFIRMED, InvoiceStatus.PAID]} />
      </InvoiceTooltipContext.Provider>
    </Box>
  );
};
