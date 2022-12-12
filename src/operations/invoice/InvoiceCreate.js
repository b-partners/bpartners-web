import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Save } from '@mui/icons-material';
import { makeStyles } from '@mui/styles';
import { Typography, Box, FormControl, Card, CardContent } from '@mui/material';
import { ClientSelection } from './ClientSelection';
import { CustomButton } from '../utils/CustomButton';
import { ProductSelection } from './ProductSelection';
import invoiceProvider, { invoicePutController } from 'src/providers/invoice-provider';
import { totalCalculus, invoiceDateValidator, getInvoicePdfUrl } from './utils';
import CustomFilledInput from '../utils/CustomFilledInput';
import debounce from 'debounce';

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
      onPending('stopPending');
    }
    onPending('startPending');
    invoiceProvider
      .saveOrUpdate([data])
      .then(([updatedInvoice]) => getInvoicePdfUrl(updatedInvoice.fileId))
      .then(pdfUrl =>
        setTimeout(async () => {
          onPending('stopPending', pdfUrl);
        }, 3000)
      );
  };

  const saveAndClose = () => {
    onSubmit();
    close();
  };

  useEffect(() => {
    getInvoicePdfUrl(toEdit.fileId).then(pdfUrl => onPending('stopPending', pdfUrl));
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
            <ProductSelection name='products' formValidator={formValidator} />
            <Box sx={{ display: 'block' }}>
              <Box sx={{ width: 300, display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <Typography variant='h6'>Total:</Typography>
                <Typography variant='h6'>{totalCalculus(/*TODO: bad implem, see preprod DRAFT-FAC202201*/ selectedProducts)}€</Typography>
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
