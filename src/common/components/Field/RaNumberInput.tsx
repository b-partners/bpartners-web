import { IconButton, Typography } from '@mui/material';
import { FC } from 'react';
import { TextInput } from 'react-admin';
import { RaNumberInputProps } from './types';

// Callback taking the value from the form state, and returning the input value.
const format = (value: string) => `${value || ''}`.replace('.', ',');

// Callback taking the input value, and returning the value you want stored in the form state.
const parse = (value: string) => {
  if (!/[^\d,]/.test(value)) {
    return `${value || ''}`.replace(',', '.');
  }
  return value.slice(0, value.length - 1);
};

export const RaNumberInput: FC<RaNumberInputProps> = props => {
  const { icon, endText, ...others } = props;

  const inputProps = (icon || endText) && {
    endAdornment: icon ? (
      <IconButton>{icon}</IconButton>
    ) : (
      <Typography variant='h5' color='text.secondary'>
        {endText}
      </Typography>
    ),
  };

  return <TextInput {...others} format={format} parse={parse} InputProps={inputProps} />;
};
