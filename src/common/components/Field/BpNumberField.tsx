import { IconButton, TextField } from '@mui/material';
import { ChangeEvent, FC } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { BP_TEXT_FIELD } from './style';
import { BpFieldProps } from './types';

export const BpNumberField: FC<BpFieldProps> = ({ name, icon, onClickOnIcon, ...others }) => {
  const {
    register,
    formState: { errors },
    setValue,
  } = useFormContext();
  const value = useWatch({ name });

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    if (!/[^\d,+-]/.test(value)) {
      setValue(name, `${value}`.replace(',', '.'));
    }
  };

  const customRegister = { ...register(name), onChange: handleChange };
  const error = errors[name];
  const errorMessage = (error?.message as string) || '';

  return (
    <TextField
      {...customRegister}
      {...others}
      sx={BP_TEXT_FIELD}
      value={`${value || ''}`.replace('.', ',')}
      variant='filled'
      error={error && !errorMessage.includes('Expected string')}
      inputProps={{ icon }}
      helperText={error && !errorMessage.includes('Expected string') && errorMessage}
      data-testid={`${name}-field-input`}
      InputProps={{
        endAdornment: icon && (
          <IconButton sx={{ background: 'transparent !important' }} onClick={onClickOnIcon}>
            {icon}
          </IconButton>
        ),
      }}
    />
  );
};
