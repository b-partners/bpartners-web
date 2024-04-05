import { Autocomplete, FormHelperText, TextField } from '@mui/material';
import { useFormContext, useWatch } from 'react-hook-form';

export const BpAutoComplete = ({ name, label, error, ...others }) => {
  const {
    register,
    formState: { errors },
    setValue,
  } = useFormContext();
  const value = useWatch({ name });

  const handleChange = (event, newvalue) => {
    setValue(name, newvalue);
  };

  const customRegister = { ...register(name), onChange: handleChange };
  return (
    <div>
      <Autocomplete
        {...customRegister}
        {...others}
        value={value}
        data-testid={`${name}-auto-complete`}
        renderInput={params => <TextField {...params} label={label} error={errors && !!errors[name]} />}
      />

      <FormHelperText style={{ marginLeft: '14px' }} error>
        {errors[name]?.message}
      </FormHelperText>
    </div>
  );
};
