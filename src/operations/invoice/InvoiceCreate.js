import { useEffect } from 'react';
import { useNotify, useRefresh } from 'react-admin';
import { useForm } from 'react-hook-form';
import { makeStyles } from '@material-ui/styles';
import { ClientSelection } from './ClientSelection';
import { CustomButton } from '../utils/CustomButton';
import { ProductSelection } from './ProductSelection';
import invoiceProvider from 'src/providers/invoice-provider';
import { Typography, Box, FormControl, Card, CardContent } from '@mui/material';
import { totalCalculus, invoiceDateValidator, invoiceInitialValue, getInvoicePdfUrl } from './utils';
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
  const { toEdit, className, onPending } = props;
  const formValidator = useForm();
  const notify = useNotify();
  const refresh = useRefresh();
  const classes = useStyle();
  let onSubmitDebounced = null;

  const update = value => {
    Object.keys(value).forEach(e => {
      if (value.id.length > 0 && e === 'ref') {
        formValidator.setValue(e, value[e].slice(0, '-TMP')[0]);
      }
      formValidator.setValue(e, value[e]);
    });
  };

  const selectedProducts = formValidator.watch('products') || [];
  const onSubmit = () => {
    const data = formValidator.watch();
    onPending('startPending');
    invoiceProvider
      .saveOrUpdate([data])
      .then(([data]) => {
        return getInvoicePdfUrl(data.fileId);
      })
      .then(pdfUrl => {
        onPending('stopPending', pdfUrl);
        refresh();
      })
      .catch(() => {
        notify("Une erreur s'est produite, veuillez réessayer", { type: 'error' });
      });
  };

  useEffect(() => {
    formValidator.clearErrors();
    getInvoicePdfUrl(toEdit.fileId).then(pdfUrl => onPending('stopPending', pdfUrl));
    onSubmitDebounced = debounce(onSubmit, 500);
    update(toEdit);
  }, [toEdit]);

  useEffect(() => {
    formValidator.watch(() => {
      if (onSubmitDebounced !== null) {
        onSubmitDebounced();
      }
    });
  }, []);

  return (
    <Box className={className}>
      <Card>
        <CardContent>
          <form className={classes.form} onSubmit={formValidator.handleSubmit(onSubmit)}>
            <FormControl className={classes.formControl}>
              <CustomFilledInput name='title' label='Titre' formValidator={formValidator} />
              <CustomFilledInput name='ref' label='Référence' formValidator={formValidator} />
              <CustomFilledInput validate={e => invoiceDateValidator(e)} name='sendingDate' label="Date d'envoie" type='date' formValidator={formValidator} />
              <CustomFilledInput
                validate={e => invoiceDateValidator(e, formValidator.watch('sendingDate'))}
                name='toPayAt'
                label='Date de payment'
                type='date'
                formValidator={formValidator}
              />
            </FormControl>
            <ClientSelection name='customer' formValidator={formValidator} />
            <ProductSelection name='products' formValidator={formValidator} />
            <Box sx={{ display: 'block' }}>
              <Box sx={{ width: 300, display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <Typography variant='h6'>Total:</Typography>
                <Typography variant='h6'>{totalCalculus(selectedProducts)}€</Typography>
              </Box>
              <CustomButton onClick={() => update(invoiceInitialValue)} label='Effacer le formulaire' />
            </Box>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default InvoiceCreateOrUpdate;
