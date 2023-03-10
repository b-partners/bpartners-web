import { RefreshOutlined as RefreshIcon, Save } from '@mui/icons-material';
import { Box, IconButton, Stack, Switch, Typography, FormControl } from '@mui/material';
import debounce from 'debounce';
import { useEffect, useState } from 'react';
import { useNotify, useRefresh } from 'react-admin';
import { useForm } from 'react-hook-form';
import invoiceProvider from 'src/providers/invoice-provider';
import { BPButton } from '../../common/components/BPButton';
import BPFormField from '../../common/components/BPFormField';
import PdfViewer from '../../common/components/PdfViewer';
import useGetAccountHolder from '../../common/hooks/use-get-account-holder';
import { prettyPrintMinors } from '../../common/utils/money';
import { ClientSelection } from './components/ClientSelection';
import { ProductSelection } from './components/ProductSelection';

import InvoiceAccordion from './components/InvoiceAccordion';
import PaymentRegulationsForm from './components/PaymentRegulationsForm';
import { INVOICE_EDITION } from './style';
import {
  DELAY_PENALTY_PERCENT,
  getInvoicePdfUrl,
  GLOBAL_DISCOUNT_PERCENT_VALUE,
  InvoiceActionType,
  invoiceDateValidator,
  PDF_EDITION_WIDTH,
  productValidationHandling,
  PRODUCT_NAME,
  retryOnError,
  totalPriceWithoutVatFromProducts,
  totalPriceWithVatFromProducts,
} from './utils/utils';
import { InvoicePaymentTypeEnum } from 'bpartners-react-client';
import { PAYMENT_REGULATIONS, PAYMENT_TYPE, validatePaymentRegulation } from './utils/payment-regulation-utils';
import { invoiceMapper } from './utils/invoice-utils';
import DiscountForm from './components/DiscountForm';

const InvoiceForm = props => {
  const { toEdit, onPending, nbPendingInvoiceCrupdate, onClose, selectedInvoiceRef, documentUrl } = props;
  const form = useForm({ mode: 'all', defaultValues: { delayInPaymentAllowed: 30 } });
  const notify = useNotify();
  const refresh = useRefresh();
  const paymentRegulationType = form.watch(PAYMENT_TYPE);
  const paymentRegulations = form.watch(PAYMENT_REGULATIONS);
  const paymentRegulationsError = validatePaymentRegulation(paymentRegulationType, paymentRegulations);

  const updateInvoiceForm = _newInvoice => {
    const actualInvoice = form.watch();
    const formHasNewUpdate =
      // Check submittedAt to avoid rolling back to a previous update when an older call finished before a newer call
      !_newInvoice.metadata || !actualInvoice.metadata || new Date(_newInvoice.metadata.submittedAt) > new Date(actualInvoice.metadata.submittedAt);
    if (formHasNewUpdate) {
      const newInvoice = invoiceMapper.toDomain(_newInvoice);
      Object.keys(newInvoice).forEach(key => form.setValue(key, newInvoice[key]));
    }
  };

  const validateInvoice = ifValid => {
    return form.handleSubmit(data => {
      productValidationHandling(data[PRODUCT_NAME], PRODUCT_NAME, form.setError, form.clearErrors);
      const paymentRegulationError = validatePaymentRegulation(data[PAYMENT_TYPE], data[PAYMENT_REGULATIONS]);
      if (!paymentRegulationError && !form.formState.errors[PRODUCT_NAME]) {
        ifValid();
      }
    });
  };

  const isPaymentTypeCash = form.watch(PAYMENT_TYPE) === InvoicePaymentTypeEnum.CASH;
  const togglePaymentType = () => {
    if (!isPaymentTypeCash) {
      form.setValue(PAYMENT_REGULATIONS, null);
    }
    form.setValue(PAYMENT_TYPE, isPaymentTypeCash ? InvoicePaymentTypeEnum.IN_INSTALMENT : InvoicePaymentTypeEnum.CASH);
  };

  const onSubmit = validateInvoice(() => {
    if (nbPendingInvoiceCrupdate > 0) {
      onPending(InvoiceActionType.STOP_PENDING);
    }
    onPending(InvoiceActionType.START_PENDING);
    const submittedAt = new Date();
    retryOnError(
      () =>
        invoiceProvider
          .saveOrUpdate([form.watch()])
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
        refresh();
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
  const [openedAccordion, openAccordion] = useState(1);
  const isSubjectToVat = companyInfo && companyInfo.isSubjectToVat;
  const totalPrice = isSubjectToVat ? totalPriceWithVatFromProducts(form.watch().products) : totalPriceWithoutVatFromProducts(form.watch().products);

  return (
    <Box sx={INVOICE_EDITION.LAYOUT}>
      <form style={INVOICE_EDITION.FORM} onSubmit={form.handleSubmit(onSubmit)}>
        <InvoiceAccordion label='Informations générales' index={1} isExpanded={openedAccordion} onExpand={openAccordion}>
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
          <DiscountForm name={GLOBAL_DISCOUNT_PERCENT_VALUE} label='Remise' form={form} />
          <ClientSelection name='customer' label='Client' form={form} />
          <BPFormField name='comment' rows={3} multiline label='Commentaire' form={form} shouldValidate={false} />
          <FormControl>
            <Typography color='text.secondary'>Payer en plusieurs fois :</Typography>
            <Stack direction='row' spacing={1} alignItems='center'>
              <Switch checked={!isPaymentTypeCash} onChange={togglePaymentType} />
              <Typography>{isPaymentTypeCash ? 'Non' : 'Oui'}</Typography>
            </Stack>
          </FormControl>
        </InvoiceAccordion>
        <InvoiceAccordion error={form.formState.errors[PRODUCT_NAME]} label='Produits' index={2} isExpanded={openedAccordion} onExpand={openAccordion}>
          <ProductSelection name={PRODUCT_NAME} form={form} />
        </InvoiceAccordion>
        {!isPaymentTypeCash && (
          <InvoiceAccordion error={paymentRegulationsError} label='Payment' index={3} isExpanded={openedAccordion} onExpand={openAccordion}>
            <PaymentRegulationsForm form={form} />
          </InvoiceAccordion>
        )}
        <InvoiceTotalPrice totalPrice={totalPrice} isSubjectToVat={isSubjectToVat} />
        <BPButton id='form-save-id' onClick={saveAndClose} label='Enregistrer' icon={<Save />} sx={{ marginTop: 10 }} />
      </form>
      <PdfViewer width={PDF_EDITION_WIDTH} url={documentUrl} filename={selectedInvoiceRef} isPending={nbPendingInvoiceCrupdate > 0}>
        <IconButton id='form-refresh-preview' onClick={form.handleSubmit(onSubmit)} size='small' title='Rafraîchir'>
          <RefreshIcon />
        </IconButton>
      </PdfViewer>
    </Box>
  );
};

const InvoiceTotalPrice = props => {
  const { isSubjectToVat, totalPrice } = props;
  return (
    <Box sx={{ width: 300, display: 'flex', justifyContent: 'space-between', marginBlock: 5 }}>
      <Typography variant='h6'>{isSubjectToVat ? 'Total TTC' : 'Total HT'}</Typography>
      <Typography variant='h6'>{prettyPrintMinors(totalPrice)}</Typography>
    </Box>
  );
};
export default InvoiceForm;
