import { IconButton, TextField } from '@mui/material';
import { FC } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { BP_TEXT_FIELD } from './style';
import { BpFieldProps } from './types';

export const BpTextField: FC<BpFieldProps> = props => {
  const { name, icon, onClickOnIcon, ...others } = props;
  const {
    register,
    formState: { errors },
  } = useFormContext();
  const value = useWatch({ name });

  return (
    <TextField
      {...register(name)}
      {...others}
      sx={BP_TEXT_FIELD}
      value={value}
      variant='filled'
      error={!!errors[name]}
      inputProps={{ icon }}
      helperText={errors[name]?.message as string}
      data-testid={`${name}-field-input`}
      InputProps={{
        endAdornment: icon && <IconButton onClick={onClickOnIcon}>{icon}</IconButton>,
      }}
    />
  );
};
