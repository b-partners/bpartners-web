import { RefreshOutlined as RefreshIcon, Save } from '@mui/icons-material';
import { Box, Card, CardContent, FormControl, IconButton, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import debounce from 'debounce';
import { useEffect } from 'react';
import { useNotify } from 'react-admin';
import { useForm } from 'react-hook-form';
import invoiceProvider from 'src/providers/invoice-provider';
import { CustomButton } from '../utils/CustomButton';
import CustomFilledInput from '../utils/CustomFilledInput';
import { prettyPrintMinors } from '../utils/money';
import PdfViewer from '../utils/PdfViewer';
import { ClientSelection } from './ClientSelection';
import { ProductSelection } from './ProductSelection';

import { getInvoicePdfUrl, InvoiceActionType, invoiceDateValidator, productValidationHandling, retryOnError, totalPriceWithVatFromProducts } from './utils';

const useStyle = makeStyles(() => ({
  document: { width: '60%' },
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
  const { toEdit, className, onPending, nbPendingInvoiceCrupdate, onClose, selectedInvoiceRef, documentUrl } = props;
  const form = useForm({ mode: 'all', defaultValues: { delayInPaymentAllowed: 23 } });
  const classes = useStyle();
  const notify = useNotify();
  const PRODUCT_NAME = 'products';

  const updateInvoiceForm = newInvoice => {
    const actualInvoice = form.watch();
    const formHasNewUpdate =
      // Check submittedAt to avoid rolling back to a previous update when an older call finished before a newer call
      !newInvoice.metadata || !actualInvoice.metadata || new Date(newInvoice.metadata.submittedAt) > new Date(actualInvoice.metadata.submittedAt);
    if (formHasNewUpdate) {
      Object.keys(newInvoice).forEach(key => form.setValue(key, newInvoice[key]));
    }
  };

  const validateInvoice = ifValid => {
    return form.handleSubmit(data => {
      productValidationHandling(data[PRODUCT_NAME], PRODUCT_NAME, form.setError, form.clearErrors);
      if (!form.formState.errors[PRODUCT_NAME]) {
        ifValid();
      }
    });
  };

  const onSubmit = validateInvoice(() => {
    if (nbPendingInvoiceCrupdate > 0) {
      onPending(InvoiceActionType.STOP_PENDING);
    }
    onPending(InvoiceActionType.START_PENDING);

    const submittedAt = new Date();
    const toSubmit = {
      ...form.watch(),
      metadata: { ...form.watch().metadata, submittedAt: submittedAt.toISOString() },
    };
    retryOnError(
      () =>
        invoiceProvider
          .saveOrUpdate([toSubmit])
          .then(([updatedInvoice]) => getInvoicePdfUrl(updatedInvoice.fileId))
          .then(pdfUrl => onPending(InvoiceActionType.STOP_PENDING, pdfUrl)),
      error => error.response.status === 429 && (!form.watch().metadata || submittedAt > new Date(form.watch().metadata.submittedAt))
    );
  });

  const saveAndClose = () => {
    const synchroneSaveAndClose = async () => {
      await onSubmit();
      if (Object.keys(form.formState.errors).length !== 0) {
        notify('Veuillez remplir correctement tous les champs', { type: 'error' });
      } else {
        onClose();
      }
    };
    synchroneSaveAndClose();
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
    <Box sx={{ display: 'flex', width: 'inherit', flexWrap: 'wrap', justifyContent: 'space-around' }}>
      <Box className={className}>
        <Card className={classes.card}>
          <CardContent>
            <form className={classes.form} onSubmit={form.handleSubmit(onSubmit)}>
              <FormControl className={classes.formControl}>
                <CustomFilledInput name='title' label='Titre' form={form} />
                <CustomFilledInput name='ref' label='Référence' form={form} />
                <CustomFilledInput
                  validate={e => invoiceDateValidator({ sendingDate: e })}
                  name='sendingDate'
                  label="Date d'émission"
                  type='date'
                  form={form}
                />
                <CustomFilledInput
                  validate={e => invoiceDateValidator({ toPayAt: e, sendingDate: form.watch('sendingDate') })}
                  name='toPayAt'
                  label='Date limite de validité'
                  type='date'
                  form={form}
                />
                <CustomFilledInput
                  validate={e => e && e >= 0 && e < 31}
                  name='delayInPaymentAllowed'
                  label='Délai de retard de payment autorisé (jours)'
                  type='number'
                  form={form}
                />
              </FormControl>
              <CustomFilledInput name='comment' label='Commentaire' form={form} shouldValidate={false} />
              <ClientSelection name='customer' form={form} />
              <ProductSelection name={PRODUCT_NAME} form={form} />
              <Box sx={{ display: 'block' }}>
                <Box sx={{ width: 300, display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <Typography variant='h6'>Total TTC :</Typography>
                  <Typography variant='h6'>{prettyPrintMinors(totalPriceWithVatFromProducts(form.watch().products))}</Typography>
                </Box>
                <CustomButton id='form-save-id' onClick={saveAndClose} label='Enregistrer' icon={<Save />} sx={{ marginTop: 10 }} />
              </Box>
            </form>
          </CardContent>
        </Card>
      </Box>
      <PdfViewer url={documentUrl} filename={selectedInvoiceRef} isPending={nbPendingInvoiceCrupdate > 0} className={classes.document}>
        <IconButton id='form-refresh-preview' onClick={form.handleSubmit(onSubmit)} size='small' title='Rafraîchir'>
          <RefreshIcon />
        </IconButton>
      </PdfViewer>
    </Box>
  );
};

export default InvoiceCreateOrUpdate;
