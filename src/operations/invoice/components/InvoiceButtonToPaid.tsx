import { PaymentMethod } from 'bpartners-react-client';
import { useState } from 'react';
import { useTranslate } from 'react-admin';
import { useChangeInvoiceStatus } from 'src/common/hooks';
import { useGetConversionContext } from 'src/common/store/invoice';
import { CircularProgress, Typography, Box, TextField, MenuItem, Button } from '@mui/material';
import { DoneAll as DoneAllIcon } from '@mui/icons-material';
import PopoverButton from 'src/common/components/PopoverButton';

type InvoiceButtonConversionProps = {
  disabled?: boolean;
};

const paymentMethodList: { label: string; value: PaymentMethod }[] = [
  { label: 'Non spécifiée', value: PaymentMethod.UNKNOWN },
  { label: 'Espèces', value: PaymentMethod.CASH },
  { label: 'Virement bancaire', value: PaymentMethod.BANK_TRANSFER },
  { label: 'Chèque', value: PaymentMethod.CHEQUE },
];

export const InvoiceButtonToPaid = (props: InvoiceButtonConversionProps) => {
  const { disabled } = props;
  const translate = useTranslate();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.UNKNOWN);

  const { invoice } = useGetConversionContext();
  const { fetch, isLoading } = useChangeInvoiceStatus(
    { ...invoice, paymentMethod },
    'PAID',
    translate(`resources.invoices.conversion.PAID.success`, { smart_count: 2 })
  );

  return (
    <PopoverButton data-testid={`invoice-conversion-PAID-${invoice.ref}-1`} icon={<DoneAllIcon />} disabled={isLoading || disabled} label='Marquer comme payée'>
      <Box sx={{ width: '13rem', padding: 1 }}>
        <Typography variant='h6'>Mode de paiement : </Typography>
        <TextField sx={{ width: '13rem', paddingBottom: 2 }} value={paymentMethod} data-testid='invoice-payment-method-select' select>
          {paymentMethodList.map(option => (
            <MenuItem onClick={() => setPaymentMethod(option.value)} key={`${option.value}`} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
        <Button
          title={translate(`resources.invoices.conversion.PAID.title`, { smart_count: 2 })}
          data-testid={`invoice-conversion-PAID-${invoice.ref}`}
          disabled={isLoading || disabled}
          startIcon={isLoading ? <CircularProgress size='25px' /> : <DoneAllIcon />}
          onClick={fetch}
          sx={{ width: '100%' }}
        >
          Marquer comme payée
        </Button>
      </Box>
    </PopoverButton>
  );
};
