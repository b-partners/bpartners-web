import TooltipButton from '../../../common/components/TooltipButton';
import { Invoice, InvoiceStatus } from 'bpartners-react-client';
import { Box, CircularProgress } from '@mui/material';
// @ts-ignore
import { Attachment, Check, DoneAll, DriveFileMove, TurnRight } from '@mui/icons-material';
import { useInvoiceContext, useInvoiceContextRequest } from '../../../common/hooks';
import { useState } from 'react';
import { useNotify } from 'react-admin';
import { InvoiceTooltip } from './InvoiceTooltipButton';

const LIST_ACTION_STYLE = { display: 'flex' };
type LoadingState = 'toProposal' | 'toPaid' | 'toConfirmed';
type InvoiceListActionButtonsProps = {
  invoice: Invoice;
  setInvoiceToRelaunch: any;
};

export const InvoiceListActionButtons = ({ invoice, setInvoiceToRelaunch }: InvoiceListActionButtonsProps) => {
  const { setDocumentUrl } = useInvoiceContext();
  const { convertToProposal, convertToConfirmed, convertToPaid } = useInvoiceContextRequest();
  const notify = useNotify();
  const [isLoading, setLoading] = useState<LoadingState | null>(null);
  const click = (f: () => void) => {
    return (event: ClipboardEvent) => {
      event.stopPropagation();
      f();
    };
  };

  const viewPdf = click(() => setDocumentUrl(invoice.fileId));

  const onConvert = (type: LoadingState, converter: (i: Invoice) => Promise<void>) => {
    setLoading(type);
    converter(invoice)
      .then(() => notify(`invoice.${type}.success`, { type: 'success' }))
      .catch(() => notify(`invoice.${type}.error`, { type: 'error' }))
      .finally(() => setLoading(null));
  };

  const onRelaunchInvoice = click(() => setInvoiceToRelaunch(invoice));

  return (
    <Box sx={LIST_ACTION_STYLE}>
      <TooltipButton title='Justificatif' onClick={viewPdf} icon={<Attachment />} disabled={!invoice.fileId} />
      <InvoiceTooltip.ToProposal invoice={invoice} />
      <InvoiceTooltip.ToConfirmed invoice={invoice} />
      {invoice.status === InvoiceStatus.PROPOSAL && (
        <>
          <TooltipButton
            disabled={false}
            title='Envoyer ou relancer ce devis'
            icon={<TurnRight />}
            onClick={onRelaunchInvoice}
            invoice-testid={`relaunch-${invoice.id}`}
          />
        </>
      )}
      <InvoiceTooltip.ToPaid invoice={invoice} />
      {invoice.status !== InvoiceStatus.PROPOSAL && invoice.status !== InvoiceStatus.DRAFT && (
        <>
          <TooltipButton
            disabled={invoice.status === InvoiceStatus.PAID}
            title='Envoyer ou relancer cette facture'
            icon={<TurnRight />}
            onClick={onRelaunchInvoice}
            invoice-testid={`relaunch-${invoice.id}`}
          />
        </>
      )}
    </Box>
  );
};
