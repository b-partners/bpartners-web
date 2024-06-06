import { RefreshOutlined as RefreshIcon, Save } from '@mui/icons-material';
import { Box, Checkbox, FormControl, FormControlLabel, IconButton, Typography } from '@mui/material';
import debounce from 'debounce';
import { useEffect, useState } from 'react';
import { SimpleForm, useNotify, useRefresh } from 'react-admin';
import { FormProvider, useForm } from 'react-hook-form';
import { BPButton } from '../../common/components/BPButton';
import PdfViewer from '../../common/components/PdfViewer';
import useGetAccountHolder from '../../common/hooks/use-get-account-holder';
import { parseUrlParams, prettyPrintMinors, UrlParams } from '../../common/utils';
import { ClientSelection } from './components/ClientSelection';
import { ProductSelection } from './components/ProductSelection';

import { InvoicePaymentTypeEnum } from '@bpartners/typescript-client';
import { CreateInDialogButton } from '@react-admin/ra-form-layout';
import { BpFormField } from 'src/common/components';
import BpTextAdornment from 'src/common/components/BpTextAdornment';
import { useInvoiceToolContext } from 'src/common/store/invoice';
import { handleSubmit, printError } from 'src/common/utils';
import { AUTOCOMPLETE_LIST_LENGTH } from 'src/constants';
import { customerProvider } from 'src/providers';
import { invoiceProvider } from 'src/providers/invoice-provider';
import AnnotatorComponent from '../annotator/AnnotatorComponent';
import { AnnotationInfo } from '../annotator/components';
import CustomerTypeRadioGroup from '../customers/components/CustomerTypeRadioGroup';
import FormCustomer from '../customers/components/FormCustomer';
import CheckboxForm from './components/CheckboxForm';
import InvoiceAccordion from './components/InvoiceAccordion';
import PaymentRegulationsForm from './components/PaymentRegulationsForm';
import { DEFAULT_TEXT_FIELD_WIDTH, INVOICE_EDITION } from './style';
import { validateDIPAllowed, validateDPPercent } from './utils';
import { invoiceMapper } from './utils/invoice-utils';
import { PAYMENT_REGULATIONS, PAYMENT_TYPE, validatePaymentRegulation } from './utils/payment-regulation-utils';
import { useRetrievePolygons } from './utils/use-retrieve-polygons';
import {
  CUSTOMER_NAME,
  DELAY_PENALTY_PERCENT,
  getReceiptUrl,
  GLOBAL_DISCOUNT,
  InvoiceActionType,
  invoiceDateValidator,
  PDF_EDITION_WIDTH,
  productValidationHandling,
  PRODUCT_NAME,
  retryOnError,
  titleValidator,
  totalPriceWithoutVatFromProducts,
  totalPriceWithVatFromProducts,
} from './utils/utils';

const InvoiceForm = props => {
  const { toEdit, onPending, nbPendingInvoiceCrupdate, selectedInvoiceRef, documentUrl } = props;
  const form = useForm({ mode: 'all' });
  const notify = useNotify();
  const refresh = useRefresh();
  const paymentRegulationType = form.watch(PAYMENT_TYPE);
  const paymentRegulations = form.watch(PAYMENT_REGULATIONS);
  const paymentRegulationsError = validatePaymentRegulation(paymentRegulationType, paymentRegulations);
  const { returnToListByStatus } = useInvoiceToolContext();
  const [isOpenCreateInDialogButton, setIsOpenCreateInDialogButton] = useState(true);
  const { polygons, annotations, isAnnotationEmpty } = useRetrievePolygons();
  const toggle = () => setIsOpenCreateInDialogButton(!isOpenCreateInDialogButton);

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
      if (
        !paymentRegulationError &&
        !form.formState.errors[PRODUCT_NAME] &&
        data[CUSTOMER_NAME] &&
        data['customer'] !== null &&
        data['products'] &&
        data['products']?.length > 0
      ) {
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
      !isAnnotationEmpty && form.setValue('idAreaPicture', annotations.idAreaPicture);
      retryOnError(
        () =>
          invoiceProvider
            .saveOrUpdate([form.watch()], { isEdition: true })
            .then(([updatedInvoice]) => onPending(InvoiceActionType.STOP_PENDING, getReceiptUrl(updatedInvoice.fileId, 'INVOICE'))),
        error => error?.response?.status === 429 && (!form.watch().metadata || submittedAt > new Date(form.watch().metadata.submittedAt))
      ).catch(err => err?.response?.status === 400 && notify(err.response.data.message, { type: 'error', autoHideDuration: 10000 }));
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
        UrlParams.clear();
      }
    };

    synchronousSaveAndClose().catch(printError);
  };

  useEffect(() => {
    onPending(InvoiceActionType.STOP_PENDING, getReceiptUrl(toEdit.fileId, 'INVOICE'));
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

  const submitNewCustomer = async values => {
    // create the new customer
    const createdCustomerResponse = await customerProvider.saveOrUpdate([values]);
    // get all customers
    const fetcher = async q => await customerProvider.getList(1, AUTOCOMPLETE_LIST_LENGTH, { customerListSearch: q });
    const allCustomers = await fetcher();
    // find the last customer created
    const lastCustomer = allCustomers.find(customer => customer.id === createdCustomerResponse[0].id);
    // update customer value in autoComplete
    form.setValue('customer', lastCustomer);
    // notification success
    notify('messages.customer.create', { type: 'success' });
    // close the modal
    toggle();
  };

  return (
    <Box sx={INVOICE_EDITION.LAYOUT}>
      <FormProvider {...form}>
        <form style={INVOICE_EDITION.FORM} onSubmit={handleSubmit(onSubmit)}>
          {!isAnnotationEmpty && (
            <InvoiceAccordion width='333px' label="Informations d'annotation" index={0} isExpanded={openedAccordion} onExpand={openAccordion}>
              {annotations?.annotations.map((annotation, i) => (
                <AnnotationInfo areaPictureAnnotationInstance={annotation} key={i} />
              ))}
            </InvoiceAccordion>
          )}
          <InvoiceAccordion label='Informations générales' index={1} isExpanded={openedAccordion} onExpand={openAccordion}>
            <BpFormField name='title' label='Titre' validate={titleValidator} />
            <BpFormField name='ref' label='Référence' />
            <BpFormField validate={e => invoiceDateValidator({ sendingDate: e })} name='sendingDate' label="Date d'émission" type='date' />
            <BpFormField
              validate={e => invoiceDateValidator({ validityDate: e, sendingDate: form.watch('sendingDate') })}
              name='validityDate'
              label='Date limite de validité'
              type='date'
            />
            <ClientSelection name='customer' label='Rechercher un client' />
            {isOpenCreateInDialogButton && (
              <div style={{ marginBottom: '8px' }} data-testid='create-new-customer'>
                <CreateInDialogButton fullWidth title='Créer un nouveau client' label='Créer un nouveau client' resource='customers'>
                  <SimpleForm onSubmit={submitNewCustomer}>
                    <CustomerTypeRadioGroup />
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        columnGap: '20px',
                        width: '100%',
                      }}
                    >
                      <FormCustomer />
                    </div>
                  </SimpleForm>
                </CreateInDialogButton>
              </div>
            )}
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
      <div>
        {!isAnnotationEmpty && <AnnotatorComponent width={PDF_EDITION_WIDTH} allowAnnotation={false} poly_gone={polygons} allowSelect={false} />}
        <PdfViewer width={PDF_EDITION_WIDTH} url={documentUrl} filename={selectedInvoiceRef} isPending={nbPendingInvoiceCrupdate > 0}>
          <IconButton id='form-refresh-preview' onClick={handleSubmit(onSubmit)} size='small' title='Rafraîchir'>
            <RefreshIcon />
          </IconButton>
        </PdfViewer>
      </div>
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
