import { InvoiceStatus } from 'bpartners-react-client';
import { ReactElement } from 'react';
import { useTranslate } from 'react-admin';
import TooltipButton from 'src/common/components/TooltipButton';
import { useChangeInvoiceStatus } from 'src/common/hooks';
import { useGetConversionContext } from 'src/common/store/invoice';
import { CircularProgress } from '@mui/material';

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
