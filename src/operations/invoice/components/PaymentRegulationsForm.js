import { Add as AddIcon, Cancel as CancelIcon, Save as SaveIcon } from '@mui/icons-material';
import { Box, FormControl, FormHelperText, Paper } from '@mui/material';
import { InvoicePaymentTypeEnum } from 'bpartners-react-client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { BPButton } from 'src/common/components/BPButton';
import BPFormField from 'src/common/components/BPFormField';
import { INVOICE_EDITION } from '../style';
import {
  DefaultPaymentRegulation,
  formatPaymentRegulation,
  getPercentValue,
  missingPaymentRegulation,
  paymentRegulationErrorMessage,
  PAYMENT_REGULATIONS,
  PAYMENT_TYPE,
  ScreenMode,
  validatePaymentRegulation,
  validateRegulationPercentage,
} from '../utils/payment-regulation-utils';
import { TOTAL_PRICE_WITHOUT_VAT, TOTAL_PRICE_WITH_VAT } from '../utils/utils';
import PaymentRegulationItem from './PaymentRegulationItem';

const { IN_INSTALMENT } = InvoicePaymentTypeEnum;

const PaymentRegulationsForm = props => {
  const { VIEW, EDIT } = ScreenMode;

  const { form } = props;
  const { watch, setValue } = form;
  const [{ screenMode, toEditIndex }, setScreenMode] = useState({ screenMode: VIEW, toEditIndex: null });

  const paymentRegulationType = watch(PAYMENT_TYPE);
  const paymentRegulations = watch(PAYMENT_REGULATIONS);
  const totalPrice = watch(TOTAL_PRICE_WITH_VAT) || watch(TOTAL_PRICE_WITHOUT_VAT);
  const isInInstalment = screenMode === VIEW && paymentRegulationType === IN_INSTALMENT;

  const handleEdit = index => setScreenMode({ screenMode: EDIT, toEditIndex: index });
  const handleCreate = () => setScreenMode({ screenMode: EDIT, toEditIndex: null });
  const handleCancel = () => setScreenMode({ screenMode: VIEW, toEditIndex: null });
  const handleSave = data => {
    if (toEditIndex === null) {
      setValue(PAYMENT_REGULATIONS, [...(paymentRegulations ? paymentRegulations : []), data]);
    } else {
      const newPaymentRegulations = paymentRegulations.slice();
      newPaymentRegulations[toEditIndex] = data;
      setValue(PAYMENT_REGULATIONS, newPaymentRegulations);
    }
    handleCancel();
  };
  const handleRemove = index =>
    setValue(
      PAYMENT_REGULATIONS,
      paymentRegulations.filter((_element, k) => k !== index)
    );
  const error = validatePaymentRegulation(paymentRegulationType, paymentRegulations);
  const paymentRegulationRest = missingPaymentRegulation(paymentRegulations);
  return (
    <FormControl sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }} error={error}>
      {paymentRegulations && paymentRegulations.length > 0 && (
        <Box sx={INVOICE_EDITION.LONG_LIST}>
          <PaymentRegulationItem
            totalPrice={totalPrice}
            key={`paymentRegulation-key-static`}
            data={paymentRegulationRest}
            onEdit={handleEdit}
            onRemove={handleRemove}
          />
          {paymentRegulations && paymentRegulations.map(paymentRegulationItems(handleEdit, handleRemove))}
        </Box>
      )}
      {screenMode === EDIT && (
        <RegulationsForm
          paymentRegulations={paymentRegulations}
          onSave={handleSave}
          onCancel={handleCancel}
          isCreation={toEditIndex === null}
          toEdit={toEditIndex !== null ? paymentRegulations[toEditIndex] : DefaultPaymentRegulation}
        />
      )}
      {error && <FormHelperText sx={{ width: 300 }}>{paymentRegulationErrorMessage}</FormHelperText>}
      {isInInstalment && (
        <BPButton id='form-create-regulation-id' onClick={handleCreate} label='Ajouter un paiement' icon={<AddIcon />} sx={{ marginBottom: 5, marginTop: 1 }} />
      )}
    </FormControl>
  );
};

const paymentRegulationItems = (onEdit, onRemove) => (paymentRegulation, index) => {
  const handleEdit = () => {
    onEdit(index);
  };
  const handleRemove = () => onRemove(index);

  return (
    <PaymentRegulationItem
      key={`paymentRegulation-key-${index}`}
      data={paymentRegulation}
      onEdit={handleEdit}
      onRemove={handleRemove}
      percentValue={getPercentValue(paymentRegulation)}
    />
  );
};

const RegulationsForm = props => {
  const { toEdit, onSave, isCreation, onCancel, paymentRegulations } = props;
  const form = useForm({ mode: 'all', defaultValues: { ...toEdit } });
  const handleSubmit = form.handleSubmit(onSave);

  const validatePercentage = e => validateRegulationPercentage({ paymentRegulations, value: e });

  return (
    <Paper elevation={3}>
      <FormControl sx={{ margin: 1 }}>
        <CustomBpField validate={validatePercentage} type='number' form={form} name='percent' label='Pourcentage' />
        <CustomBpField type='date' form={form} name='maturityDate' label='Date limite de paiement' />
        <CustomBpField type='text' form={form} name='comment' label='Commentaire' shouldValidate={false} data-testid='payment-regulation-comment-id' />
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <BPButton
            style={{ width: 284 }}
            id='form-regulation-save-id'
            onClick={handleSubmit}
            label={isCreation ? 'Créer' : 'Modifier'}
            icon={<SaveIcon />}
            sx={{ marginBlock: 1 }}
          />
          <BPButton style={{ width: 284 }} id='form-regulation-cancel-id' onClick={onCancel} label='Annuler' icon={<CancelIcon />} sx={{ marginBlock: 1 }} />
        </Box>
      </FormControl>
    </Paper>
  );
};

const CustomBpField = props => <BPFormField style={{ width: 284 }} {...props} />;

export default PaymentRegulationsForm;
