import { Save } from '@mui/icons-material';
import { Box, Card, CardContent, FormControl, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import debounce from 'debounce';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import invoiceProvider, { invoicePutController } from 'src/providers/invoice-provider';
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
}));

const InvoiceCreateOrUpdate = props => {
  const { toEdit, className, onPending, isPending, close } = props;
  const formValidator = useForm();
  const classes = useStyle();

  const updateInvoiceForm = newInvoice => {
    const actualInvoice = formValidator.watch();
    const formHasNewUpdate =
      !newInvoice.metadata ||
      !actualInvoice.metadata ||
      (new Date(newInvoice.metadata.submittedAt) > new Date(actualInvoice.metadata.submittedAt) &&
        // Only amounts are not known frontend-side.
        // Hence they are the only information that can change accross backend calls.
        // TODO: check product.amounts
        newInvoice.totalPriceWithVat !== actualInvoice.totalPriceWithVat);
    if (formHasNewUpdate) {
      Object.keys(newInvoice).forEach(key => formValidator.setValue(key, newInvoice[key]));
    }
  };

  const onSubmit = () => {
    if (isPending > 0) {
      invoicePutController.abort();
      onPending(InvoiceActionType.STOP_PENDING);
    }
    onPending(InvoiceActionType.START_PENDING);

    const toSubmit = { ...formValidator.watch(), metadata: { ...formValidator.watch().metadata, submittedAt: new Date().toISOString() } };
    invoiceProvider
      .saveOrUpdate([toSubmit])
      .then(([updatedInvoice]) => {
        updateInvoiceForm(updatedInvoice);
        return getInvoicePdfUrl(updatedInvoice.fileId);
      })
      .then(pdfUrl => {
        const hopeInMillisForBackendToBeConsistent = 3000;
        setTimeout(async () => {
          onPending(InvoiceActionType.STOP_PENDING, pdfUrl);
        }, hopeInMillisForBackendToBeConsistent);
      });
  };

  const saveAndClose = () => {
    onSubmit();
    close();
  };

  useEffect(() => {
    getInvoicePdfUrl(toEdit.fileId).then(pdfUrl => onPending(InvoiceActionType.STOP_PENDING, pdfUrl));
    updateInvoiceForm(toEdit);
  }, [toEdit]);

  useEffect(() => {
    const onSubmitDebounced = debounce(onSubmit, 1000);
    formValidator.watch(() => onSubmitDebounced());
  }, []);

  return (
    <Box className={className}>
      <Card>
        <CardContent>
          <form className={classes.form} onSubmit={formValidator.handleSubmit(onSubmit)}>
            <FormControl className={classes.formControl}>
              <CustomFilledInput name='title' label='Titre' formValidator={formValidator} />
              <CustomFilledInput name='ref' label='Référence' formValidator={formValidator} />
              <CustomFilledInput validate={e => invoiceDateValidator(e)} name='sendingDate' label="Date d'envoi" type='date' formValidator={formValidator} />
              <CustomFilledInput
                validate={e => invoiceDateValidator(e, formValidator.watch('sendingDate'))}
                name='toPayAt'
                label='Date de paiement'
                type='date'
                formValidator={formValidator}
              />
            </FormControl>
            <ClientSelection name='customer' formValidator={formValidator} />
            <ProductSelection name='products' formValidator={formValidator} />
            <Box sx={{ display: 'block' }}>
              <Box sx={{ width: 300, display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <Typography variant='h6'>Total TTC :</Typography>
                <Typography variant='h6'>{prettyPrintMinors(formValidator.watch().totalPriceWithVat)}</Typography>
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
