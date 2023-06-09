import TooltipButton from '../../../common/components/TooltipButton';
import { Invoice, InvoiceStatus } from 'bpartners-react-client';
import { Box, CircularProgress } from '@mui/material';
// @ts-ignore
import { Attachment, Check, DoneAll, DriveFileMove, TurnRight } from '@mui/icons-material';
import { useInvoiceContext, useInvoiceContextRequest } from '../../../common/hooks';
import { useState } from 'react';
import { useNotify } from 'react-admin';

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
  const onConvertToPaid = click(() => onConvert('toPaid', convertToPaid));
  const onConvertToProposal = click(() => onConvert('toProposal', convertToProposal));
  const onConvertToConfirmed = click(() => onConvert('toConfirmed', convertToConfirmed));

  return (
    <Box sx={LIST_ACTION_STYLE}>
      <TooltipButton title='Justificatif' onClick={viewPdf} icon={<Attachment />} disabled={!invoice.fileId} />
      {invoice.status === InvoiceStatus.DRAFT && (
        <TooltipButton
          disabled={isLoading === 'toProposal'}
          icon={isLoading === 'toProposal' ? <CircularProgress /> : <DriveFileMove />}
          title='Convertir en devis'
          onClick={onConvertToProposal}
        />
      )}
      {invoice.status === InvoiceStatus.PROPOSAL && (
        <>
          <TooltipButton
            disabled={isLoading === 'toProposal'}
            icon={isLoading === 'toProposal' ? <CircularProgress /> : <Check />}
            title='Transformer en facture'
            onClick={onConvertToConfirmed}
          />
          <TooltipButton title='Envoyer ou relancer ce devis' icon={<TurnRight />} onClick={onRelaunchInvoice} invoice-testid={`relaunch-${invoice.id}`} />
        </>
      )}
      {invoice.status !== InvoiceStatus.PROPOSAL && invoice.status !== InvoiceStatus.DRAFT && (
        <>
          <TooltipButton
            disabled={invoice.status === InvoiceStatus.PAID}
            title='Marquer comme payée'
            icon={<DoneAll />}
            onClick={onConvertToPaid}
            invoice-testid={`pay-${invoice.id}`}
          />
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
