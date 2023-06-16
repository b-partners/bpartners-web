import { Box } from '@mui/material';
import { Save } from '@mui/icons-material';
import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { ClientSelection } from './components/ClientSelection';
import { ProductSelection } from './components/ProductSelection';

import InvoiceAccordion from './components/InvoiceAccordion';
import { INVOICE_EDITION } from './style';
import { DELAY_PENALTY_PERCENT, GLOBAL_DISCOUNT, invoiceDateValidator, PRODUCT_NAME } from './utils/utils';
import CheckboxForm from './components/CheckboxForm';
import BpTextAdornment from 'src/common/components/BpTextAdornment';
import { BpFormField } from 'src/common/components';
import { handleSubmit } from 'src/common/utils';
import { useInvoiceContext, useInvoiceContextRequest } from 'src/common/hooks';
import { invoiceResolver } from '../../common/resolvers';
import { BPButton } from 'src/common/components/BPButton';
import { InvoiceTotalPrice, PaymentRegulationAccordion } from './components';
import { InvoiceFormPdf } from './components/InvoiceFormPdf';
import { debounce } from 'debounce';

const InvoiceForm = () => {
  const [openedAccordion, openAccordion] = useState(1);
  const { state } = useInvoiceContext();
  const form = useForm({ mode: 'all', defaultValues: state.invoice, resolver: invoiceResolver });
  const { saveOrUpdateInvoice } = useInvoiceContextRequest();
  const { setView } = useInvoiceContext();

  const onSubmit = handleSubmit(form.handleSubmit(saveOrUpdateInvoice));

  const onSave = () => {
    onSubmit();
    setView('list');
  };

  useEffect(() => {
    console.log(form.formState.errors);
  }, [form.formState.errors]);

  useEffect(() => {
    const onSubmitDebounced = debounce(onSubmit, 1000);
    form.watch(data => {
      onSubmitDebounced();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Box sx={INVOICE_EDITION.LAYOUT}>
      <FormProvider {...form}>
        <form style={INVOICE_EDITION.FORM} onSubmit={onSubmit}>
          <InvoiceAccordion label='Informations générales' index={1} isExpanded={openedAccordion} onExpand={openAccordion}>
            <BpFormField name='title' label='Titre' />
            <BpFormField name='ref' label='Référence' />
            <BpFormField validate={e => invoiceDateValidator({ sendingDate: e })} name='sendingDate' label="Date d'émission" type='date' />
            <BpFormField name='validityDate' label='Date limite de validité' type='date' />
            <ClientSelection name='customer' label='Client' />
            <BpFormField name='comment' rows={3} multiline label='Commentaire' shouldValidate={false} />
            <CheckboxForm switchlabel='Ajouter un délai de retard de paiement autorisé' type='number' name='delayInPaymentAllowed' label='Délai de retard'>
              <BpFormField
                type='number'
                name='delayInPaymentAllowed'
                label='Délai de retard'
                InputProps={{
                  endAdornment: <BpTextAdornment label='Jour' />,
                }}
              />
              <BpFormField
                type='number'
                name={DELAY_PENALTY_PERCENT}
                label='Pénalité de retard'
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
          <BPButton id='form-save-id' onClick={onSave} label='Enregistrer' icon={<Save />} sx={{ marginTop: 10 }} />
        </form>
      </FormProvider>
      <InvoiceFormPdf />
    </Box>
  );
};

export default InvoiceForm;
