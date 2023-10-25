import { TextField, Autocomplete } from '@mui/material';
import { useFormContext, useWatch } from 'react-hook-form';

export const BpAutoComplete = ({ name, label, ...others }) => {
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
    <Autocomplete
      {...customRegister}
      {...others}
      value={value}
      error={errors[name]}
      data-testid={`${name}-auto-complete`}
      // disablePortal
      renderInput={params => <TextField {...params} label={label} />}
    />
  );
};
