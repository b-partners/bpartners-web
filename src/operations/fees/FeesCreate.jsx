import React, {
  useState, useEffect,
} from 'react';

import {
  BooleanInput,
  Create,
  TextInput,
  DateInput,
  RadioButtonGroupInput,
  SimpleForm,
  useDataProvider,
  required,
  minValue,
  maxValue,
  number,
} from 'react-admin';
import { useFormContext } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import {
  manualFeeTypes, predefinedFeeTypes, predefinedFirstDueDates,
} from '../../conf';

function PredefinedFeeTypeRadioButton({ setFeesConf, ...props }) {
  return (
    <RadioButtonGroupInput
      {...props}
      source="predefined_type"
      label="Type prédéfini"
      choices={Object.keys(predefinedFeeTypes).map((id) => ({ id, name: predefinedFeeTypes[id].name }))}
      onChange={({ target: { value } }) => setFeesConf(predefinedFeeTypes[value])}
    />
  );
}

function ManualFeeTypeRadioButton(props) {
  return (
    <RadioButtonGroupInput
      {...props}
      source="manual_type"
      label="Type manuel"
      choices={Object.keys(manualFeeTypes).map((id) => ({ id, name: manualFeeTypes[id].name }))}
    />
  );
}

function PredefinedFirstDueDateRadioButton(props) {
  return (
    <RadioButtonGroupInput
      {...props}
      source="predefined_first_dueDate"
      label="Première date limite prédéfinie"
      choices={Object.keys(predefinedFirstDueDates).map((id) => ({
        id,
        name: predefinedFirstDueDates[id].name,
      }))}
    />
  );
}

function FeesCreate(props) {
  const params = useParams();
  const { studentId } = params;
  const [studentRef, setStudentRef] = useState('...');
  const dataProvider = useDataProvider();
  useEffect(() => {
    const doEffect = async () => {
      const student = await dataProvider.getOne('students', { id: studentId });
      setStudentRef(student.data.ref);
    };
    doEffect();
    // eslint-disable-next-line
  }, [studentRef]);

  const defaultIsPredefinedType = 'true';
  const [isPredefinedType, setIsPredefinedType] = useState(defaultIsPredefinedType);

  const [feesConf, setFeesConf] = useState({
    monthlyAmount: null,
    monthsNumber: null,
    comment: null,
  });

  const defaultIsPredefinedFirstDueDate = 'true';
  const [isPredefinedFirstDueDate, setIsPredefinedFirstDueDate] = useState(defaultIsPredefinedFirstDueDate);

  return (
    // https://marmelab.com/blog/2022/04/12/react-admin-v4-new-form-framework.html
    <Create
      {...props}
      title={`Frais de ${studentRef}`}
      resource="fees"
      redirect={() => `students/${studentId}/fees`}
      // may be parameters (_basePath, _id, _data)
      // transform={feesConfToFeesApi}
    >
      <SimpleForm>
        <BooleanInput
          source="is_predefined_type"
          label="Type prédéfini ?"
          defaultValue={defaultIsPredefinedType}
          onChange={({ target: { checked } }) => setIsPredefinedType(checked)}
        />
        {isPredefinedType ? (
          <PredefinedFeeTypeRadioButton setFeesConf={setFeesConf} validate={required()} />
        ) : (
          <ManualFeeTypeRadioButton validate={required()} />
        )}
        <FeesConfInput isPredefinedType={isPredefinedType} feesConf={feesConf} />

        <BooleanInput
          source="is_predefined_first_dueDate"
          label="Première date limite prédéfinie ?"
          defaultValue={defaultIsPredefinedFirstDueDate}
          fullWidth="true"
          onChange={({ target: { checked } }) => setIsPredefinedFirstDueDate(checked)}
        />
        {isPredefinedFirstDueDate ? (
          <PredefinedFirstDueDateRadioButton validate={required()} />
        ) : (
          <DateInput
            source="manual_first_duedate"
            label="Première date limite manuelle"
            fullWidth="true"
            validate={required()}
          />
        )}
      </SimpleForm>
    </Create>
  );
}

function FeesConfInput({ isPredefinedType, feesConf }) {
  const { setValue } = useFormContext();
  if (isPredefinedType) {
    setValue('monthly_amount', feesConf.monthlyAmount || 0);
    setValue('months_number', feesConf.monthsNumber || 0);
    setValue('comment', feesConf.name || '');
  }

  const validateMonthlyAmount = [required(), number(), minValue(1)];
  const validateMonthsNumber = [required(), number(), minValue(1), maxValue(12)];

  return (
    <div>
      <TextInput
        source="monthly_amount"
        label="Montant de la mensualité"
        fullWidth="true"
        disabled={isPredefinedType}
        validate={validateMonthlyAmount}
      />
      <TextInput
        source="months_number"
        label="Nombre de mensualités"
        fullWidth="true"
        disabled={isPredefinedType}
        validate={validateMonthsNumber}
      />
      <TextInput
        source="comment"
        label="Commentaire"
        fullWidth="true"
        disabled={isPredefinedType}
        validate={required()}
      />
    </div>
  );
}
export default FeesCreate;
