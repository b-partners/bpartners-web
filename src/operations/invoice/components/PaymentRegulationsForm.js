import { Add as AddIcon, Cancel as CancelIcon, Save as SaveIcon } from '@mui/icons-material';
import { Box, FormControl, FormHelperText, InputLabel, MenuItem, Paper, Select, TextField } from '@mui/material';
import { InvoicePaymentTypeEnum } from 'bpartners-react-client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { BPButton } from 'src/common/components/BPButton';
import BPFormField from 'src/common/components/BPFormField';
import { PaymentTypeFr } from 'src/constants/payment-type';
import {
  DefaultPaymentRegulation,
  paymentRegulationErrorMessage,
  PAYMENT_REGULATIONS,
  PAYMENT_TYPE,
  ScreenMode,
  TOTAL_PRICE_WITH_VAT,
  validatePaymentRegulation,
  validateRegulationPercentage,
} from '../utils';
import PaymentRegulationItem from './PaymentRegulationItem';

const { IN_INSTALMENT, CASH } = InvoicePaymentTypeEnum;

const PaymentRegulationsForm = props => {
  const { VIEW, EDIT } = ScreenMode;

  const { form } = props;
  const { watch, setValue } = form;
  const [{ screenMode, toEditIndex }, setScreenMode] = useState({ screenMode: VIEW, toEditIndex: null });

  const paymentRegulationType = watch(PAYMENT_TYPE);
  const paymentRegulations = watch(PAYMENT_REGULATIONS);
  const totalPriceWithVat = watch(TOTAL_PRICE_WITH_VAT);
  const isInInstalment = screenMode === VIEW && paymentRegulationType === IN_INSTALMENT;

  const handleEdit = index => setScreenMode({ screenMode: EDIT, toEditIndex: index });
  const handleCreate = () => setScreenMode({ screenMode: EDIT, toEditIndex: null });
  const handleCancel = () => setScreenMode({ screenMode: VIEW, toEditIndex: null });
  const handleSave = data => {
    if (toEditIndex === null) {
      setValue(PAYMENT_REGULATIONS, [...paymentRegulations, data]);
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
  const setPaymentType = value => setValue(PAYMENT_TYPE, value);
  const error = validatePaymentRegulation(paymentRegulationType, paymentRegulations);

  return (
    <FormControl sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }} error={error}>
      <PaymentTypeForm onChange={setPaymentType} value={paymentRegulationType || ''} />
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
      {isInInstalment && paymentRegulations && paymentRegulations.map(paymentRegulationItems(handleEdit, handleRemove, totalPriceWithVat))}
      {isInInstalment && (
        <BPButton id='form-create-regulation-id' onClick={handleCreate} label='Ajouter un paiement' icon={<AddIcon />} sx={{ marginBottom: 5, marginTop: 1 }} />
      )}
    </FormControl>
  );
};

const paymentRegulationItems = (onEdit, onRemove, totalPriveWithVat) => (paymentRegulation, index) => {
  const handleEdit = () => {
    onEdit(index);
  };
  const handleRemove = () => onRemove(index);

  return (
    <PaymentRegulationItem
      totalPriveWithVat={totalPriveWithVat}
      key={`paymentRegulation-key-${index}`}
      data={paymentRegulation}
      onEdit={handleEdit}
      onRemove={handleRemove}
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
        <BPFormField validate={validatePercentage} type='number' form={form} name='percent' label='Pourcentage' />
        <BPFormField type='date' form={form} name='maturityDate' label='Date limite de paiement' />
        <BPFormField type='text' form={form} name='comment' label='Commentaire' shouldValidate={false} data-testid='payment-regulation-comment-id' />
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <BPButton id='form-regulation-save-id' onClick={handleSubmit} label={isCreation ? 'Créer' : 'Modifier'} icon={<SaveIcon />} sx={{ marginBlock: 1 }} />
          <BPButton id='form-regulation-cancel-id' onClick={onCancel} label='Annuler' icon={<CancelIcon />} sx={{ marginBlock: 1 }} />
        </Box>
      </FormControl>
    </Paper>
  );
};

const PaymentTypeForm = props => {
  const { onChange, value } = props;

  const handleChange = event => onChange(event.target.value);

  return (
    <FormControl variant='filled' sx={{ width: 300, marginBlock: 3 }}>
      <InputLabel id='payment-type-selection-id'>Type de paiement</InputLabel>
      <Select labelId='payment-type-selection-id' value={value} onChange={handleChange}>
        <MenuItem value={CASH}>{PaymentTypeFr.CASH}</MenuItem>
        <MenuItem value={IN_INSTALMENT}>{PaymentTypeFr.IN_INSTALMENT}</MenuItem>
      </Select>
    </FormControl>
  );
};

export default PaymentRegulationsForm;
