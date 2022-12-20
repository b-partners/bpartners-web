import { Save } from '@mui/icons-material';
import { Box, Card, CardContent, FormControl, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import debounce from 'debounce';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import invoiceProvider, { invoicePutController } from 'src/providers/invoice-provider';
import { CustomButton } from '../utils/CustomButton';
import CustomFilledInput from '../utils/CustomFilledInput';
import { ClientSelection } from './ClientSelection';
import { ProductFormControl } from './ProductFormControl';
import { getInvoicePdfUrl, InvoiceActionType, invoiceDateValidator, totalCalculus } from './utils';

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

  const update = value => Object.keys(value).forEach(e => formValidator.setValue(e, value[e]));

  const selectedProducts = formValidator.watch('products') || [];

  const onSubmit = () => {
    const data = formValidator.watch();
    if (isPending > 0) {
      invoicePutController.abort();
      onPending(InvoiceActionType.STOP_PENDING);
    }
    onPending(InvoiceActionType.START_PENDING);
    invoiceProvider
      .saveOrUpdate([data])
      .then(([updatedInvoice]) => getInvoicePdfUrl(updatedInvoice.fileId))
      .then(pdfUrl =>
        setTimeout(async () => {
          onPending(InvoiceActionType.STOP_PENDING, pdfUrl);
        }, 3000)
      );
  };

  const saveAndClose = () => {
    onSubmit();
    close();
  };

  useEffect(() => {
    getInvoicePdfUrl(toEdit.fileId).then(pdfUrl => onPending(InvoiceActionType.STOP_PENDING, pdfUrl));
    update(toEdit);
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
            <ProductFormControl name='products' formValidator={formValidator} />
            <Box sx={{ display: 'block' }}>
              <Box sx={{ width: 300, display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <Typography variant='h6'>Total:</Typography>
                <Typography variant='h6'>{totalCalculus(selectedProducts)}€</Typography>
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
