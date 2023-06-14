import { Check, DoneAll, DriveFileMove, TurnRight, Attachment } from '@mui/icons-material';
import { CircularProgress } from '@mui/material';
import { Invoice, InvoiceStatus } from 'bpartners-react-client';
import { ReactNode, useContext } from 'react';
import { BP_COLOR } from 'src/bp-theme';
import TooltipButton from 'src/common/components/TooltipButton';
import { useInvoiceContext, useInvoiceContextRequest } from 'src/common/hooks';
import { useFetch } from 'src/common/hooks/use-fetch';
import { InvoiceTooltipContext } from 'src/common/store';
import { stopPropagation } from 'src/common/utils';

interface InvoiceChangeStatusButtonProps {
  title: string;
  icon: ReactNode;
  name: string;
  onFetch: () => Promise<any>;
  disabled?: boolean;
}
interface InvoiceRelaunchProps {
  invoice: Invoice;
  statusToShow: InvoiceStatus[];
}

const InvoiceChangeStatusButton = (props: InvoiceChangeStatusButtonProps) => {
  const { onFetch, icon, title, name, disabled } = props;
  const { isLoading, trigger } = useFetch(onFetch, name);

  return (
    <TooltipButton
      disabled={isLoading || disabled}
      icon={isLoading ? <CircularProgress size='24px' style={{ color: BP_COLOR['20'] }} /> : icon}
      title={title}
      onClick={stopPropagation(trigger)}
    />
  );
};

type InvoiceToolTipsProps = {
  invoice: Invoice;
};

const ToProposal = (props: InvoiceToolTipsProps) => {
  const { invoice } = props;
  const { convertToProposal } = useInvoiceContextRequest();

  return (
    invoice.status === InvoiceStatus.DRAFT && (
      <InvoiceChangeStatusButton name='draftToProposal' title='Convertir en devis' onFetch={() => convertToProposal(invoice)} icon={<DriveFileMove />} />
    )
  );
};

const ToConfirmed = (props: InvoiceToolTipsProps) => {
  const { invoice } = props;
  const { convertToConfirmed } = useInvoiceContextRequest();

  return (
    invoice.status === InvoiceStatus.PROPOSAL && (
      <InvoiceChangeStatusButton name='proposalToConfirmed' title='Transformer en facture' onFetch={() => convertToConfirmed(invoice)} icon={<Check />} />
    )
  );
};

const ToPaid = (props: InvoiceToolTipsProps) => {
  const { invoice } = props;
  const { convertToPaid } = useInvoiceContextRequest();

  return (
    invoice.status !== InvoiceStatus.PROPOSAL &&
    invoice.status !== InvoiceStatus.DRAFT && (
      <InvoiceChangeStatusButton
        disabled={invoice.status === InvoiceStatus.PAID}
        name='confirmedToPaid'
        title='Marquer comme payée'
        onFetch={() => convertToPaid(invoice)}
        icon={<DoneAll />}
      />
    )
  );
};

const Relaunch = (props: InvoiceRelaunchProps) => {
  const { invoice, statusToShow } = props;
  const { setInvoiceModal } = useInvoiceContext();

  const onRelaunch = stopPropagation(() =>
    setInvoiceModal(
      {
        isOpen: true,
        type: 'Relaunch',
      },
      invoice
    )
  );

  return (
    statusToShow.includes(invoice.status) && (
      <TooltipButton
        disabled={invoice.status === InvoiceStatus.PAID}
        title={`Envoyer ou relancer ${invoice.status === InvoiceStatus.PROPOSAL ? 'ce devis' : 'cette facture'}`}
        icon={<TurnRight />}
        onClick={onRelaunch}
        data-testid={`relaunch-${invoice.id}`}
      />
    )
  );
};

type DocumentPreviewProps = {
  onClick: (e: ClipboardEvent) => void;
  invoice: Invoice;
};

const DocumentPreview = (props: DocumentPreviewProps) => {
  const { invoice, onClick } = props;

  return <TooltipButton title='Justificatif' onClick={onClick} icon={<Attachment />} disabled={!invoice.fileId} />;
};

type InvoiceToolTipProps = { type: 'toProposal' | 'toConfirmed' | 'toPaid' | 'toRelaunch' | 'toDocument'; status?: InvoiceStatus[] };

export const InvoiceTooltip = (props: InvoiceToolTipProps) => {
  const { type, status } = props;
  const { invoice, onViewPdf } = useContext(InvoiceTooltipContext);
  switch (type) {
    case 'toConfirmed':
      return <ToConfirmed invoice={invoice} />;
    case 'toPaid':
      return <ToPaid invoice={invoice} />;
    case 'toProposal':
      return <ToProposal invoice={invoice} />;
    case 'toRelaunch':
      return <Relaunch invoice={invoice} statusToShow={status} />;
    case 'toDocument':
      return <DocumentPreview invoice={invoice} onClick={onViewPdf} />;
  }
};
