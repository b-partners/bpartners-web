import { Invoice, InvoiceStatus } from 'bpartners-react-client';
import { Box } from '@mui/material';
import { useInvoiceContext } from '../../../common/hooks';
import { InvoiceTooltip } from './InvoiceTooltipButton';
import { stopPropagation } from 'src/common/utils';
import { InvoiceTooltipContext } from 'src/common/store';

const LIST_ACTION_STYLE = { display: 'flex' };
type InvoiceListActionButtonsProps = {
  invoice: Invoice;
  setInvoiceToRelaunch: any;
};

export const InvoiceListActionButtons = ({ invoice }: InvoiceListActionButtonsProps) => {
  const { setDocumentUrl, setInvoiceModal } = useInvoiceContext();

  const onViewPdf = stopPropagation(() => setDocumentUrl(invoice.fileId));
  const onRelaunch = stopPropagation(() => setInvoiceModal({ isOpen: true, type: 'Relaunch' }, invoice));

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
