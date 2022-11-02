import { useEffect } from 'react';
import { useNotify, useRefresh } from 'react-admin';
import { Typography, Box, FormControl, Card, CardHeader, CardContent } from '@mui/material';
import { makeStyles } from '@material-ui/styles';
import { ClientSelection } from './ClientSelection';
import { ProductSelection } from './ProductSelection';
import { CustomButton } from '../utils/CustomButton';
import invoiceProvider from 'src/providers/invoice-provider';
import { totalCalculus, invoiceDateValidator } from './utils';
import { useForm } from 'react-hook-form';
import CustomFilledInput from '../utils/CustomFilledInput';

export const invoiceInitialValue = {
  id: '',
  ref: '',
  title: '',
  customer: null,
  products: [],
  sendingDate: '',
  toPayAt: '',
  status: 'DRAFT',
};

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

  const update = value => {
    Object.keys(value).forEach(e => {
      if (value.id.length > 0 && e === 'ref') {
        formValidator.setValue(e, value[e].slice(0, '-TMP')[0]);
      }
      formValidator.setValue(e, value[e]);
    });
  };

  useEffect(() => {
    formValidator.clearErrors();
    update(toEdit);
  }, [toEdit]);

  useEffect(() => {
    let temp = null;
    setTimeout(() => {
      formValidator.watch(data => {
        if (data !== temp) {
          temp = data;
          onSubmit(data);
        }
      });
    }, 1000);
  }, []);

  const selectedProducts = formValidator.watch('products') || [];
  const onSubmit = data => {
    onPending('increase');
    invoiceProvider
      .saveOrUpdate([data])
      .then(() => {
        onPending('decrease');
        refresh();
      })
      .catch(() => {
        notify("Une erreur s'est produite, veuillez réessayer", { type: 'error' });
      });
  };

  return (
    <Box className={className}>
      <Card>
        <CardHeader title='Devis/Facturation' />
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
