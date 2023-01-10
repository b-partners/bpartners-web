import { RefreshOutlined as RefreshIcon, Save } from '@mui/icons-material';
import { Box, Card, CardContent, FormControl, IconButton, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import debounce from 'debounce';
import { useEffect } from 'react';
import { useNotify } from 'react-admin';
import { useForm } from 'react-hook-form';
import invoiceProvider from 'src/providers/invoice-provider';
import { BPButton } from '../../common/components/BPButton';
import BPFormField from '../../common/components/BPFormField';
import { formatDateTo8601 } from '../../common/utils/date';
import { prettyPrintMinors } from '../../common/utils/money';
import PdfViewer from '../../common/components/PdfViewer';
import { toMajors as percentToMajors, toMinors as percentToMinors } from '../../common/utils/percent';
import useGetAccountHolder from '../../common/hooks/use-get-account-holder';
import { ClientSelection } from './ClientSelection';
import { ProductSelection } from './ProductSelection';

import {
  DEFAULT_DELAY_PENALTY_PERCENT,
  DELAY_PENALTY_PERCENT,
  getInvoicePdfUrl,
  InvoiceActionType,
  invoiceDateValidator,
  PDF_EDITION_WIDTH,
  productValidationHandling,
  PRODUCT_NAME,
  retryOnError,
  totalPriceWithoutVatFromProducts,
  totalPriceWithVatFromProducts,
} from './utils';

const useStyle = makeStyles(() => ({
  document: { width: '60%', position: 'relative' },
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

const InvoiceForm = props => {
  const { toEdit, className, onPending, nbPendingInvoiceCrupdate, onClose, selectedInvoiceRef, documentUrl } = props;
  const form = useForm({ mode: 'all', defaultValues: { delayInPaymentAllowed: 30 } });
  const classes = useStyle();
  const notify = useNotify();

  const updateInvoiceForm = newInvoice => {
    const actualInvoice = form.watch();
    const formHasNewUpdate =
      // Check submittedAt to avoid rolling back to a previous update when an older call finished before a newer call
      !newInvoice.metadata || !actualInvoice.metadata || new Date(newInvoice.metadata.submittedAt) > new Date(actualInvoice.metadata.submittedAt);
    if (formHasNewUpdate) {
      Object.keys(newInvoice).forEach(key => form.setValue(key, newInvoice[key]));
      // Checking if the `key` is `delayPenaltyPercent` for each iteration may be costly
      form.setValue(DELAY_PENALTY_PERCENT, percentToMajors(newInvoice[DELAY_PENALTY_PERCENT]) || DEFAULT_DELAY_PENALTY_PERCENT);
      // TODO: implement this so we can delete this
      form.setValue('paymentRegulations', undefined);
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
    const delayPenaltyPercent = percentToMinors(parseInt(form.watch(DELAY_PENALTY_PERCENT)));

    const toSubmit = {
      ...form.watch(),
      delayPenaltyPercent,
      sendingDate: formatDateTo8601(form.watch('sendingDate'), '00:00:00'),
      validityDate: formatDateTo8601(form.watch('validityDate'), '23:59:59'),
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
    const synchronousSaveAndClose = async () => {
      await onSubmit();
      if (Object.keys(form.formState.errors).length !== 0) {
        notify('Veuillez remplir correctement tous les champs', { type: 'error' });
      } else {
        onClose(form.watch());
      }
    };

    synchronousSaveAndClose();
  };

  useEffect(() => {
    getInvoicePdfUrl(toEdit.fileId).then(pdfUrl => onPending(InvoiceActionType.STOP_PENDING, pdfUrl));
    updateInvoiceForm(toEdit);
  }, [toEdit]);

  useEffect(() => {
    const onSubmitDebounced = debounce(onSubmit, 1000);
    form.watch(() => onSubmitDebounced());
  }, []);

  const { companyInfo } = useGetAccountHolder();

  return (
    <Box className={className} sx={{ display: 'flex', width: 'inherit', flexWrap: 'wrap', justifyContent: 'space-around' }}>
      <Box>
        <Card className={classes.card}>
          <CardContent>
            <form className={classes.form} onSubmit={form.handleSubmit(onSubmit)}>
              <FormControl className={classes.formControl}>
                <BPFormField name='title' label='Titre' form={form} />
                <BPFormField name='ref' label='Référence' form={form} />
                <BPFormField validate={e => invoiceDateValidator({ sendingDate: e })} name='sendingDate' label="Date d'émission" type='date' form={form} />
                <BPFormField
                  validate={e => invoiceDateValidator({ validityDate: e, sendingDate: form.watch('sendingDate') })}
                  name='validityDate'
                  label='Date limite de validité'
                  type='date'
                  form={form}
                />
                <BPFormField
                  validate={value => value && value >= 0}
                  name='delayInPaymentAllowed'
                  label='Délai de retard de paiement autorisé (jours)'
                  type='number'
                  form={form}
                />
                <BPFormField
                  validate={value => value && value >= 0 && value <= 100}
                  name={DELAY_PENALTY_PERCENT}
                  label='Pourcentage de penalité de retard'
                  type='number'
                  form={form}
                />
              </FormControl>
              <BPFormField name='comment' label='Commentaire' form={form} shouldValidate={false} />
              <ClientSelection name='customer' form={form} />
              <ProductSelection name={PRODUCT_NAME} form={form} />
              <Box sx={{ display: 'block' }}>
                <Box sx={{ width: 300, display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <Typography variant='h6'>{companyInfo && companyInfo.isSubjectToVat ? 'Total TTC' : 'Total HT'}</Typography>
                  <Typography variant='h6'>
                    {prettyPrintMinors(
                      companyInfo && companyInfo.isSubjectToVat
                        ? totalPriceWithVatFromProducts(form.watch().products)
                        : totalPriceWithoutVatFromProducts(form.watch().products)
                    )}
                  </Typography>
                </Box>
                <BPButton id='form-save-id' onClick={saveAndClose} label='Enregistrer' icon={<Save />} sx={{ marginTop: 10 }} />
              </Box>
            </form>
          </CardContent>
        </Card>
      </Box>
      <PdfViewer
        width={PDF_EDITION_WIDTH}
        url={documentUrl}
        filename={selectedInvoiceRef}
        isPending={nbPendingInvoiceCrupdate > 0}
        className={classes.document}
      >
        <IconButton id='form-refresh-preview' onClick={form.handleSubmit(onSubmit)} size='small' title='Rafraîchir'>
          <RefreshIcon />
        </IconButton>
      </PdfViewer>
    </Box>
  );
};

export default InvoiceForm;
