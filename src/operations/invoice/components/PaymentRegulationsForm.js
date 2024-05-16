import { InvoicePaymentTypeEnum } from '@bpartners/typescript-client';
import { Add as AddIcon, Cancel as CancelIcon, Save as SaveIcon } from '@mui/icons-material';
import { Box, FormControl, FormHelperText, Paper } from '@mui/material';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { BPButton } from 'src/common/components/BPButton';
import BPFormField from 'src/common/components/BPFormField';
import BpTextAdornment from 'src/common/components/BpTextAdornment';
import { handleSubmit } from 'src/common/utils';
import { INVOICE_EDITION } from '../style';
import {
  DefaultPaymentRegulation,
  PAYMENT_REGULATIONS,
  PAYMENT_TYPE,
  ScreenMode,
  getNextMaturityDate,
  getPercentValue,
  missingPaymentRegulation,
  paymentRegulationErrorMessage,
  paymentRegulationToMajor,
  validatePaymentRegulation,
  validateRegulationPercentage,
} from '../utils/payment-regulation-utils';
import { VALIDITY_DATE } from '../utils/utils';
import PaymentRegulationItem from './PaymentRegulationItem';

const { IN_INSTALMENT } = InvoicePaymentTypeEnum;

const PaymentRegulationsForm = props => {
  const { VIEW, EDIT } = ScreenMode;

  const { form } = props;
  const { watch, setValue } = form;
  const [{ screenMode, toEditIndex }, setScreenMode] = useState({ screenMode: VIEW, toEditIndex: null });

  const paymentRegulationType = watch(PAYMENT_TYPE);
  const paymentRegulations = watch(PAYMENT_REGULATIONS);
  const validityDate = watch(VALIDITY_DATE);
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
  const paymentRegulationRest = missingPaymentRegulation(paymentRegulations, validityDate);
  paymentRegulationRest.comment = 'Le reste à payer un mois après le dernier paiement, change en fonction des acomptes que vous créerez';
  return (
    <FormControl sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }} error={error}>
      {(paymentRegulations || []).length > 0 && (
        <Box sx={INVOICE_EDITION.LONG_LIST}>
          {paymentRegulations && paymentRegulations.map(paymentRegulationItems(handleEdit, handleRemove))}
          <PaymentRegulationItem data={paymentRegulationRest} percentValue={paymentRegulationRest.percent} />
        </Box>
      )}
      {screenMode === EDIT && (
        <RegulationsForm
          onSave={handleSave}
          onCancel={handleCancel}
          indexOfSkipped={toEditIndex}
          isCreation={toEditIndex === null}
          paymentRegulations={paymentRegulations}
          toEdit={toEditIndex !== null ? paymentRegulations[toEditIndex] : paymentRegulationToMajor([DefaultPaymentRegulation])[0]}
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
      indexOfSkipped={index}
    />
  );
};

const RegulationsForm = props => {
  const { toEdit, onSave, isCreation, onCancel, paymentRegulations, indexOfSkipped } = props;
  const form = useForm({ mode: 'all', defaultValues: { ...toEdit, maturityDate: isCreation ? getNextMaturityDate(paymentRegulations) : toEdit.maturityDate } });
  const onSaveSubmit = form.handleSubmit(onSave);

  const validatePercentage = e => validateRegulationPercentage({ paymentRegulations, value: e, indexOfSkipped });

  const percentName = !indexOfSkipped || paymentRegulations[indexOfSkipped].percent ? `percent` : `paymentRequest.percentValue`;

  return (
    <Paper elevation={3}>
      <FormControl sx={{ margin: 1 }}>
        <CustomBpField
          validate={validatePercentage}
          type='number'
          form={form}
          name={percentName}
          label='Pourcentage'
          InputProps={{
            endAdornment: <BpTextAdornment label='%' />,
          }}
        />
        <CustomBpField type='date' form={form} name='maturityDate' label='Date limite de paiement' />
        <CustomBpField type='text' form={form} name='comment' label='Commentaire' shouldValidate={false} />
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <BPButton
            style={{ width: 284 }}
            id='form-regulation-save-id'
            onClick={handleSubmit(onSaveSubmit)}
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
