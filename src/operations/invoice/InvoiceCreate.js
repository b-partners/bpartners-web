import { Save } from '@mui/icons-material';
import { Box, Card, CardContent, FormControl, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import debounce from 'debounce';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import invoiceProvider from 'src/providers/invoice-provider';
import { CustomButton } from '../utils/CustomButton';
import CustomFilledInput from '../utils/CustomFilledInput';
import { prettyPrintMinors } from '../utils/money';
import { ClientSelection } from './ClientSelection';
import { ProductSelection } from './ProductSelection';
import { getInvoicePdfUrl, InvoiceActionType, invoiceDateValidator } from './utils';

const useStyle = makeStyles(() => ({
  formControl: {
    width: 300,
    justifyContent: 'space-around',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  card: {
    border: 'none',
  },
}));

const InvoiceCreateOrUpdate = props => {
  const { toEdit, className, onPending, nbPendingInvoiceCrupdate, onClose } = props;
  const form = useForm();
  const classes = useStyle();

  const updateInvoiceForm = newInvoice => {
    const actualInvoice = form.watch();
    const formHasNewUpdate =
      !newInvoice.metadata ||
      !actualInvoice.metadata ||
      (new Date(newInvoice.metadata.submittedAt) > new Date(actualInvoice.metadata.submittedAt) &&
        // Only amounts are not known frontend-side.
        // Hence they are the only information that can change across backend calls.
        // TODO: check product.amounts
        newInvoice.totalPriceWithVat !== actualInvoice.totalPriceWithVat);
    if (formHasNewUpdate) {
      Object.keys(newInvoice).forEach(key => form.setValue(key, newInvoice[key]));
    }
  };

  const onSubmit = () => {
    if (nbPendingInvoiceCrupdate > 0) {
      onPending(InvoiceActionType.STOP_PENDING);
    }
    onPending(InvoiceActionType.START_PENDING);

    const toSubmit = { ...form.watch(), metadata: { ...form.watch().metadata, submittedAt: new Date().toISOString() } };
    invoiceProvider
      .saveOrUpdate([toSubmit])
      .then(([updatedInvoice]) => {
        updateInvoiceForm(updatedInvoice);
        return getInvoicePdfUrl(updatedInvoice.fileId);
      })
      .then(pdfUrl => onPending(InvoiceActionType.STOP_PENDING, pdfUrl));
  };

  const saveAndClose = () => {
    onSubmit();
    onClose();
  };

  useEffect(() => {
    getInvoicePdfUrl(toEdit.fileId).then(pdfUrl => onPending(InvoiceActionType.STOP_PENDING, pdfUrl));
    updateInvoiceForm(toEdit);
  }, [toEdit]);

  useEffect(() => {
    const onSubmitDebounced = debounce(onSubmit, 1000);
    form.watch(() => onSubmitDebounced());
  }, []);

  return (
    <Box className={className}>
      <Card className={classes.card}>
        <CardContent>
          <form className={classes.form} onSubmit={form.handleSubmit(onSubmit)}>
            <FormControl className={classes.formControl}>
              <CustomFilledInput name='title' label='Titre' form={form} />
              <CustomFilledInput name='ref' label='Référence' form={form} />
              <CustomFilledInput validate={e => invoiceDateValidator(e)} name='sendingDate' label="Date d'envoi" type='date' form={form} />
              <CustomFilledInput
                validate={e => invoiceDateValidator(e, form.watch('sendingDate'))}
                name='toPayAt'
                label='Date de paiement'
                type='date'
                form={form}
              />
            </FormControl>
            <ClientSelection name='customer' form={form} />
            <ProductSelection name='products' form={form} />
            <Box sx={{ display: 'block' }}>
              <Box sx={{ width: 300, display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <Typography variant='h6'>Total TTC :</Typography>
                <Typography variant='h6'>
                  {isNaN(form.watch().totalPriceWithVat) ? prettyPrintMinors(0) : prettyPrintMinors(form.watch().totalPriceWithVat)}
                </Typography>
              </Box>
              <CustomButton id='form-save-id' onClick={saveAndClose} style={{ marginTop: 10 }} label='Enregistrer' icon={<Save />} />
            </Box>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default InvoiceCreateOrUpdate;
