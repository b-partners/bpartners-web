import { Box, Typography, FormControl, FormControlLabel, Checkbox } from '@mui/material';
import { Save } from '@mui/icons-material';
import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { prettyPrintMinors } from '../../common/utils';
import { ClientSelection } from './components/ClientSelection';
import { ProductSelection } from './components/ProductSelection';

import InvoiceAccordion from './components/InvoiceAccordion';
import { DEFAULT_TEXT_FIELD_WIDTH, INVOICE_EDITION } from './style';
import { DELAY_PENALTY_PERCENT, GLOBAL_DISCOUNT, invoiceDateValidator, PRODUCT_NAME } from './utils/utils';
import CheckboxForm from './components/CheckboxForm';
import BpTextAdornment from 'src/common/components/BpTextAdornment';
import { BpFormField } from 'src/common/components';
import { validateDIPAllowed, validateDPPercent } from './utils';
import { handleSubmit } from 'src/common/utils';
import { useInvoiceContext } from 'src/common/hooks';
import { invoiceResolver } from '../../common/resolvers';
import PaymentRegulationsForm from './components/PaymentRegulationsForm';
import { BPButton } from 'src/common/components/BPButton';
import { InvoiceTotalPrice, PaymentRegulationAccordion } from './components';

/**
 *






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
      ).catch(printError);
    })
 );

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
 const isSubjectToVat = companyInfo && companyInfo.isSubjectToVat;
 const totalPrice = isSubjectToVat ? totalPriceWithVatFromProducts(form.watch().products) : totalPriceWithoutVatFromProducts(form.watch().products);
 const { toEdit, onPending, nbPendingInvoiceCrupdate, onClose, selectedInvoiceRef, documentUrl } = props;
 */

const InvoiceForm = () => {
  const [openedAccordion, openAccordion] = useState(1);
  const { state } = useInvoiceContext();
  const form = useForm({ mode: 'all', defaultValues: state.invoice, resolver: invoiceResolver });

  const onSubmit = form.handleSubmit(data => {
    console.log(data);
  });

  return (
    <Box sx={INVOICE_EDITION.LAYOUT}>
      <FormProvider {...form}>
        <form style={INVOICE_EDITION.FORM} onSubmit={handleSubmit(onSubmit)}>
          <InvoiceAccordion label='Informations générales' index={1} isExpanded={openedAccordion} onExpand={openAccordion}>
            <BpFormField name='title' label='Titre' />
            <BpFormField name='ref' label='Référence' />
            <BpFormField validate={e => invoiceDateValidator({ sendingDate: e })} name='sendingDate' label="Date d'émission" type='date' />
            <BpFormField
              validate={e =>
                invoiceDateValidator({
                  validityDate: e,
                  sendingDate: form.watch('sendingDate'),
                })
              }
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

          <PaymentRegulationAccordion isExpanded={openedAccordion} onExpand={openAccordion} />
          <InvoiceTotalPrice />
          {/* <InvoiceTotalPrice totalPrice={totalPrice} isSubjectToVat={isSubjectToVat} />
          <BPButton id='form-save-id' onClick={saveAndClose} label='Enregistrer' icon={<Save />} sx={{ marginTop: 10 }} /> */}
        </form>
      </FormProvider>
      {/*<PdfViewer width={PDF_EDITION_WIDTH} url={documentUrl} filename={selectedInvoiceRef} isPending={nbPendingInvoiceCrupdate > 0}>*/}
      {/*  <IconButton id='form-refresh-preview' onClick={handleSubmit(onSubmit)} size='small' title='Rafraîchir'>*/}
      {/*    <RefreshIcon />*/}
      {/*  </IconButton>*/}
      {/*</PdfViewer>*/}
    </Box>
  );
};

export default InvoiceForm;
