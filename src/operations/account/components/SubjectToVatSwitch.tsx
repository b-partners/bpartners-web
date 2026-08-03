import { FormControlLabel, FormControlLabelProps, FormGroup, Switch } from '@mui/material';
import { useFormContext, useWatch } from 'react-hook-form';

const FIELD_NAME = 'companyInfo.isSubjectToVat';

export const SubjectToVatSwitch = () => {
  const { setValue } = useFormContext();
  const isSubjectToVat = useWatch({ name: FIELD_NAME });

  const handleChange: FormControlLabelProps['onChange'] = (_event, checked) => setValue(FIELD_NAME, checked, { shouldDirty: true, shouldValidate: true });

  return (
    <FormGroup>
      <FormControlLabel
        data-cy='companyInfo-subjectToVatSwitch'
        control={<Switch checked={!!isSubjectToVat} onChange={handleChange} />}
        label={isSubjectToVat ? 'Oui' : 'Non'}
      />
    </FormGroup>
  );
};
