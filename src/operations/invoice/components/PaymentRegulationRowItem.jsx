import { PaymentMethod } from '@bpartners/typescript-client';
import { DoneAll as DoneAllIcon } from '@mui/icons-material';
import { Button, CircularProgress, MenuItem, TableCell, TableRow, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import { useNotify, useRefresh, useTranslate } from 'react-admin';
import { useInvoiceToolContext } from '../../../common/store/invoice';
import { formatDateTime, prettyPrintMoney } from '../../../common/utils';
import { updatePaymentReg } from '../../../providers';
import { getPaymentRegulationStatusInFr } from '../utils/utils';

const PaymentRegulationRowItem = props => {
  const { invoice, paymentRegulationItem, paymentMethodList, index } = props;
  const { paymentRequest, status } = paymentRegulationItem;

  const [paymentMethod, setPaymentMethod] = useState(status.paymentMethod || PaymentMethod.UNKNOWN);
  const [isLoading, setIsLoading] = useState(false);

  const notify = useNotify();
  const refresh = useRefresh();
  const translate = useTranslate();
  const { openModal } = useInvoiceToolContext();

  const handleSubmit = async () => {
    const newPaymentRegulation = {
      ...paymentRegulationItem,
      status: {
        paymentMethod: paymentMethod,
        paymentStatus: 'PAID',
      },
    };

    try {
      setIsLoading(true);
      const newInvoice = await updatePaymentReg(invoice.id, newPaymentRegulation);
      if (newInvoice.status === 'PAID') {
        openModal({ invoice, isOpen: true, type: 'FEEDBACK' });
      }
      notify(`Acompte payé avec succès !`, { type: 'success' });
    } catch (_error) {
      notify(`Une erreur s'est produite`, { type: 'error' });
    } finally {
      setIsLoading(false);
      refresh();
    }
  };

  return (
    <TableRow>
      <TableCell>{paymentRequest?.label}</TableCell>
      <TableCell>{prettyPrintMoney(paymentRequest?.amount, true)}</TableCell>
      <TableCell>{getPaymentRegulationStatusInFr(status?.paymentStatus)}</TableCell>
      <TableCell>
        <TextField
          sx={{ width: '13rem', paddingBottom: 2 }}
          value={status.paymentMethod || paymentMethod}
          data-testid={`invoice-payment-method-select-${index}`}
          select
          onChange={e => setPaymentMethod(e.target.value)}
        >
          {paymentMethodList.map(option => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      </TableCell>
      <TableCell>
        {status?.paymentStatus === 'PAID' ? (
          <Typography style={{ textAlign: 'center' }}>Payée le: {formatDateTime(new Date(status?.updatedAt))}</Typography>
        ) : (
          <Button
            title={translate(`resources.invoices.conversion.PAID.title`, { smart_count: 2 })}
            data-testid={`invoice-conversion-PAID-${index}`}
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size='25px' /> : <DoneAllIcon />}
            onClick={handleSubmit}
            sx={{ width: '100%' }}
          >
            Marquer comme payée
          </Button>
        )}
      </TableCell>
    </TableRow>
  );
};

export default PaymentRegulationRowItem;
