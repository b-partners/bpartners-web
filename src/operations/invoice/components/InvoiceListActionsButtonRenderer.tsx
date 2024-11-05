import TooltipButton from '@/common/components/TooltipButton';
import { ConversionContext, useInvoiceToolContext } from '@/common/store/invoice';
import { Invoice, InvoiceStatus } from '@bpartners/typescript-client';
import { Attachment, Check, DriveFileMove, History, TurnRight } from '@mui/icons-material';
import { Box } from '@mui/material';
import { FC, MouseEvent, useMemo } from 'react';
import { InvoiceButtonConversion } from './InvoiceButtonConversion';
import { InvoiceButtonToPaid } from './InvoiceButtonToPaid';

const LIST_ACTION_STYLE = { display: 'flex' };

interface InvoiceListActionsButtonsRendererProps {
  record: Invoice;
  viewPdf: (event: MouseEvent, data: Invoice) => void;
}

export const InvoiceListActionsButtonsRenderer: FC<InvoiceListActionsButtonsRendererProps> = ({ record, viewPdf }) => {
  const { openModal } = useInvoiceToolContext();
  const contextValue = useMemo(() => ({ invoice: record }), [record]);
  const { invoice } = contextValue;

  return (
    <ConversionContext.Provider value={contextValue}>
      <Box sx={LIST_ACTION_STYLE}>
        <TooltipButton title='Justificatif' onClick={event => viewPdf(event, invoice)} icon={<Attachment />} disabled={!invoice?.fileId} />
        {invoice.status === InvoiceStatus.DRAFT && <InvoiceButtonConversion icon={<DriveFileMove />} to='PROPOSAL' />}
        {invoice.status === InvoiceStatus.PROPOSAL && (
          <>
            <InvoiceButtonConversion icon={<Check />} to='CONFIRMED' />
            <TooltipButton
              title='Envoyer ou relancer ce devis'
              icon={<TurnRight />}
              onClick={() => openModal({ invoice, isOpen: true, type: 'RELAUNCH' })}
              data-testid={`relaunch-${invoice.id}`}
            />
            <TooltipButton
              title='Voir les historiques de relance'
              icon={<History />}
              onClick={() => openModal({ invoice, isOpen: true, type: 'RELAUNCH_HISTORY' })}
              data-testid={`relaunch-history-${invoice.id}`}
            />
          </>
        )}
        {invoice.status !== InvoiceStatus.PROPOSAL && invoice.status !== InvoiceStatus.DRAFT && (
          <>
            <InvoiceButtonToPaid disabled={invoice.status === InvoiceStatus.PAID} />
            <TooltipButton
              disabled={invoice.status === InvoiceStatus.PAID}
              title='Envoyer ou relancer cette facture'
              icon={<TurnRight />}
              onClick={() => openModal({ invoice, isOpen: true, type: 'RELAUNCH' })}
              data-testid={`relaunch-${invoice.id}`}
            />
            <TooltipButton
              disabled={invoice.status === InvoiceStatus.PAID}
              title='Voir les historiques de relance'
              icon={<History />}
              onClick={() => openModal({ invoice, isOpen: true, type: 'RELAUNCH_HISTORY' })}
              data-testid={`relaunch-history-${invoice.id}`}
            />
          </>
        )}
      </Box>
    </ConversionContext.Provider>
  );
};
