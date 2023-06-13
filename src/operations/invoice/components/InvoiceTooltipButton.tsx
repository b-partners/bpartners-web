import { Check, DoneAll, DriveFileMove, TurnRight } from '@mui/icons-material';
import { CircularProgress } from '@mui/material';
import { Invoice, InvoiceStatus } from 'bpartners-react-client';
import { ReactNode } from 'react';
import { BP_COLOR } from 'src/bp-theme';
import TooltipButton from 'src/common/components/TooltipButton';
import { useInvoiceContextRequest } from 'src/common/hooks';
import { useFetch } from 'src/common/hooks/use-fetch';

interface InvoiceChangeStatusButtonProps {
  title: string;
  icon: ReactNode;
  name: string;
  onFetch: () => Promise<any>;
}
interface InvoiceRelaunchProps {
  title: string;
  onRelaunch: () => void;
  dataTestId: string;
}

const InvoiceChangeStatusButton = (props: InvoiceChangeStatusButtonProps) => {
  const { onFetch, icon, title, name } = props;
  const { isLoading, trigger } = useFetch(onFetch, name);

  return (
    <TooltipButton
      disabled={isLoading}
      icon={isLoading ? <CircularProgress size='24px' style={{ color: BP_COLOR['20'] }} /> : icon}
      title={title}
      onClick={trigger}
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
      <InvoiceChangeStatusButton name='confirmedToPaid' title='Marquer comme payée' onFetch={() => convertToPaid(invoice)} icon={<DoneAll />} />
    )
  );
};

const Relaunch = (props: InvoiceRelaunchProps) => {
  const { onRelaunch, title } = props;
  return <TooltipButton disabled={false} title={title} icon={<TurnRight />} onClick={onRelaunch} data-testid={props['data-testid']} />;
};

export const InvoiceTooltip = {
  ToProposal,
  ToConfirmed,
  ToPaid,
};
