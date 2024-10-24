import TooltipButton from '@/common/components/TooltipButton';
import { useChangeInvoiceStatus } from '@/common/hooks';
import { useGetConversionContext } from '@/common/store/invoice';
import { InvoiceStatus } from '@bpartners/typescript-client';
import { CircularProgress } from '@mui/material';
import { ReactElement } from 'react';
import { useTranslate } from 'react-admin';

type InvoiceButtonConversionProps = {
  to: InvoiceStatus;
  icon: ReactElement;
  disabled?: boolean;
};

export const InvoiceButtonConversion = (props: InvoiceButtonConversionProps) => {
  const { icon, to, disabled } = props;
  const translate = useTranslate();

  const { invoice } = useGetConversionContext();
  const { fetch, isLoading } = useChangeInvoiceStatus(invoice, to, translate(`resources.invoices.conversion.${to}.success`, { smart_count: 2 }));

  return (
    <TooltipButton
      data-testid={`invoice-conversion-${to}-${invoice.ref}`}
      title={translate(`resources.invoices.conversion.${to}.title`, { smart_count: 2 })}
      icon={isLoading ? <CircularProgress size='25px' /> : icon}
      onClick={fetch}
      disabled={isLoading || disabled}
    />
  );
};
