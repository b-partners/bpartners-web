import { Autocomplete, FormHelperText, TextField } from '@mui/material';
import { FC, SyntheticEvent } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { BpAutoCompleteProps } from './types';

export const BpAutoComplete: FC<BpAutoCompleteProps> = ({ name, label, ...others }) => {
  const {
    register,
    formState: { errors },
    setValue,
  } = useFormContext();
  const value = useWatch({ name });

  const handleChange = (_event: SyntheticEvent, value: any) => setValue(name, value);
  const { onBlur, ref } = register(name);
  const error = errors[name];

  return (
    <div>
      <Autocomplete
        {...others}
        ref={ref}
        value={value}
        onBlur={onBlur}
        onChange={handleChange}
        data-testid={`${name}-auto-complete`}
        renderInput={params => <TextField {...params} label={label} error={errors && !!errors[name]} />}
      />

      {!!error && (
        <FormHelperText style={{ marginLeft: '14px' }} error>
          {error?.message as string}
        </FormHelperText>
      )}
    </div>
  );
};
