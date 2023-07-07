import { RefreshOutlined as RefreshIcon, Save } from '@mui/icons-material';
import { Box, IconButton, Typography, FormControl, FormControlLabel, Checkbox } from '@mui/material';
import debounce from 'debounce';
import { useEffect, useState } from 'react';
import { useNotify, useRefresh } from 'react-admin';
import { FormProvider, useForm } from 'react-hook-form';
import { BPButton } from '../../common/components/BPButton';
import PdfViewer from '../../common/components/PdfViewer';
import useGetAccountHolder from '../../common/hooks/use-get-account-holder';
import { prettyPrintMinors } from '../../common/utils';
import { ClientSelection } from './components/ClientSelection';
import { ProductSelection } from './components/ProductSelection';

import InvoiceAccordion from './components/InvoiceAccordion';
import PaymentRegulationsForm from './components/PaymentRegulationsForm';
import { INVOICE_EDITION, DEFAULT_TEXT_FIELD_WIDTH } from './style';
import {
  CUSTOMER_NAME,
  DELAY_PENALTY_PERCENT,
  getInvoicePdfUrl,
  GLOBAL_DISCOUNT,
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
import CheckboxForm from './components/CheckboxForm';
import BpTextAdornment from 'src/common/components/BpTextAdornment';
import { BpFormField } from 'src/common/components';
import { validateDIPAllowed, validateDPPercent } from './utils';
import { handleSubmit, printError } from 'src/common/utils';
import { invoiceProvider } from 'src/providers/invoice-provider';
import { useInvoiceToolContext } from 'src/common/store/invoice';

const InvoiceForm = props => {
  const { toEdit, onPending, nbPendingInvoiceCrupdate, selectedInvoiceRef, documentUrl } = props;
  const form = useForm({ mode: 'all' });
  const notify = useNotify();
  const refresh = useRefresh();
  const paymentRegulationType = form.watch(PAYMENT_TYPE);
  const paymentRegulations = form.watch(PAYMENT_REGULATIONS);
  const paymentRegulationsError = validatePaymentRegulation(paymentRegulationType, paymentRegulations);
  const { returnToListByStatus } = useInvoiceToolContext();

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
      if (!paymentRegulationError && !form.formState.errors[PRODUCT_NAME] && data[CUSTOMER_NAME]) {
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

  const onSubmit = form.handleSubmit(
    validateInvoice(() => {
      if (nbPendingInvoiceCrupdate > 0) {
        onPending(InvoiceActionType.STOP_PENDING);
      }
      onPending(InvoiceActionType.START_PENDING);
      const submittedAt = new Date();
      retryOnError(
        () =>
          invoiceProvider
            .saveOrUpdate([form.watch()], { isEdition: true })
            .then(([updatedInvoice]) => getInvoicePdfUrl(updatedInvoice.fileId))
            .then(pdfUrl => onPending(InvoiceActionType.STOP_PENDING, pdfUrl)),
        error => error.response.status === 429 && (!form.watch().metadata || submittedAt > new Date(form.watch().metadata.submittedAt))
      ).catch(err => err.response.status === 400 && notify(err.response.data.message, { type: 'error', autoHideDuration: 10000 }));
    })
  );

  const saveAndClose = () => {
    const synchronousSaveAndClose = async () => {
      await onSubmit();
      if (Object.keys(form.formState.errors).length !== 0) {
        notify('Veuillez remplir correctement tous les champs', { type: 'error' });
        refresh();
      } else {
        returnToListByStatus(form.watch().status);
      }
    };

    synchronousSaveAndClose().catch(printError);
  };

  useEffect(() => {
    getInvoicePdfUrl(toEdit.fileId)
      .then(pdfUrl => onPending(InvoiceActionType.STOP_PENDING, pdfUrl))
      .catch(printError);
    updateInvoiceForm(toEdit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toEdit]);

  useEffect(() => {
    const onSubmitDebounced = debounce(onSubmit, 1000);
    form.watch(() => onSubmitDebounced());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { companyInfo } = useGetAccountHolder();
  const [openedAccordion, openAccordion] = useState(1);
  const isSubjectToVat = companyInfo && companyInfo.isSubjectToVat;
  const totalPrice = isSubjectToVat ? totalPriceWithVatFromProducts(form.watch().products) : totalPriceWithoutVatFromProducts(form.watch().products);

  return (
    <Box sx={INVOICE_EDITION.LAYOUT}>
      <FormProvider {...form}>
        <form style={INVOICE_EDITION.FORM} onSubmit={handleSubmit(onSubmit)}>
          <InvoiceAccordion label='Informations générales' index={1} isExpanded={openedAccordion} onExpand={openAccordion}>
            <BpFormField name='title' label='Titre' />
            <BpFormField name='ref' label='Référence' />
            <BpFormField validate={e => invoiceDateValidator({ sendingDate: e })} name='sendingDate' label="Date d'émission" type='date' />
            <BpFormField
              validate={e => invoiceDateValidator({ validityDate: e, sendingDate: form.watch('sendingDate') })}
              name='validityDate'
              label='Date limite de validité'
              type='date'
            />
            <ClientSelection name='customer' label='Client' />
            <BpFormField name='comment' rows={3} multiline label='Commentaire' shouldValidate={false} />
            <CheckboxForm switchlabel='Ajouter un délai de retard de paiement autorisé' type='number' name='delayInPaymentAllowed' label='Délai de retard'>
              <BpFormField
                type='number'
                name='delayInPaymentAllowed'
                label='Délai de retard'
                validate={validateDIPAllowed}
                InputProps={{
                  endAdornment: <BpTextAdornment label='Jour' />,
                }}
              />
              <BpFormField
                type='number'
                name={DELAY_PENALTY_PERCENT}
                label='Pénalité de retard'
                validate={validateDPPercent}
                InputProps={{
                  endAdornment: <BpTextAdornment label='%' />,
                }}
              />
            </CheckboxForm>
            <CheckboxForm switchlabel='Ajouter une remise' source={GLOBAL_DISCOUNT}>
              <BpFormField
                type='number'
                label='Remise'
                name={GLOBAL_DISCOUNT}
                InputProps={{
                  endAdornment: <BpTextAdornment label='%' />,
                }}
              />
            </CheckboxForm>
          </InvoiceAccordion>
          <InvoiceAccordion error={form.formState.errors[PRODUCT_NAME]} label='Produits' index={2} isExpanded={openedAccordion} onExpand={openAccordion}>
            <ProductSelection name={PRODUCT_NAME} form={form} />
          </InvoiceAccordion>

          <FormControl sx={{ width: DEFAULT_TEXT_FIELD_WIDTH }}>
            <FormControlLabel
              control={<Checkbox data-testid='payment-regulation-checkbox-id' checked={!isPaymentTypeCash} onChange={togglePaymentType} />}
              label='Payer en plusieurs fois'
            />
          </FormControl>
          {!isPaymentTypeCash && (
            <InvoiceAccordion error={paymentRegulationsError} label='Acompte' index={3} isExpanded={openedAccordion} onExpand={openAccordion}>
              <PaymentRegulationsForm form={form} />
            </InvoiceAccordion>
          )}
          <InvoiceTotalPrice totalPrice={totalPrice} isSubjectToVat={isSubjectToVat} />
          <BPButton id='form-save-id' onClick={saveAndClose} label='Enregistrer' icon={<Save />} sx={{ marginTop: 10 }} />
        </form>
      </FormProvider>
      <PdfViewer width={PDF_EDITION_WIDTH} url={documentUrl} filename={selectedInvoiceRef} isPending={nbPendingInvoiceCrupdate > 0}>
        <IconButton id='form-refresh-preview' onClick={handleSubmit(onSubmit)} size='small' title='Rafraîchir'>
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
