import { IconButton, Typography } from '@mui/material';
import { TextInput } from 'react-admin';

// Callback taking the value from the form state, and returning the input value.
const format = value => `${value || ''}`.replace('.', ',');

// Callback taking the input value, and returning the value you want stored in the form state.
const parse = value => {
  if (!/[^\d,]/.test(value)) {
    return `${value || ''}`.replace(',', '.');
  }
  return value.slice(0, value.length - 1);
};

export const RaNumberInput = props => {
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
