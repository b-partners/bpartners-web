import { useEffect } from 'react';
import { useNotify, useRefresh } from 'react-admin';
import { Typography, Box, FormControl, makeStyles } from '@material-ui/core';
import { Save } from '@material-ui/icons';
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

const InvoiceCreateOrUpdate = ({ toEdit }) => {
  const formValidator = useForm();
  const notify = useNotify();
  const refresh = useRefresh();
  const classes = useStyle();
  const update = (value) => {
    Object.keys(value).forEach(e => {
      if(value.id.length > 0 && e === 'ref'){
        formValidator.setValue(e, value[e].slice(0, '-TMP')[0])
      } 
      formValidator.setValue(e, value[e]);
    });
  };
  useEffect(() => {
    formValidator.clearErrors();
    update(toEdit);
  }, [toEdit]);

  const selectedProducts = formValidator.watch('products') || [];
  const onSubmit = data => {
    if (data.products.length === 0) {
      notify('Veuillez selectionner au moins un produit', { type: 'error' });
    } else {
      invoiceProvider
        .saveOrUpdate([data])
        .then(() => {
          notify('Facture bien enregistré', { type: 'success' });
          update(invoiceInitialValue, 'reset');
          refresh();
        })
        .catch(() => {
          update(invoiceInitialValue);
          notify("Une erreur s'est produite, veuillez réessayer", { type: 'error' });
        });
    }
  };

  return (
    <form className={classes.form} onSubmit={formValidator.handleSubmit(onSubmit)}>
      <Typography variant='h5'>Devis/Facturation</Typography>
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
      <Box sx={{ width: 300, display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
        <Typography variant='h5'>Total:</Typography>
        <Typography variant='h5'>{totalCalculus(selectedProducts)}€</Typography>
      </Box>
      <CustomButton type='submit' label='Enregistrer' icon={<Save />} />
    </form>
  );
};

export default InvoiceCreateOrUpdate;
