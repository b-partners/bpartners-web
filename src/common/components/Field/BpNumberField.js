import { TextField, IconButton } from '@mui/material';
import { useFormContext, useWatch } from 'react-hook-form';

const BP_TEXT_FIELD = {
  minWidth: 300,
  '.MuiInputBase-root': {
    padding: 0,
    textAlign: 'right',
  },
  '.MuiInputBase-input': {
    paddingRight: '3rem',
  },
  '.MuiIconButton-root': {
    position: 'absolute',
    right: '0.4rem',
    background: 'inherit',
  },
  'MuiTouchRipple-root': {
    border: 'none !important',
    outline: 'none !important',
  },
};

export const BpNumberField = ({ name, icon, onClickOnIcon, ...others }) => {
  const {
    register,
    formState: { errors },
    setValue,
  } = useFormContext();
  const value = useWatch({ name });

  const handleChange = event => {
    const value = event.target.value;
    if (!/[^\d,+-]/.test(value)) {
      setValue(name, value.replace(',', '.'));
    }
  };

  const customRegister = { ...register(name), onChange: handleChange };

  return (
    <TextField
      {...customRegister}
      {...others}
      sx={BP_TEXT_FIELD}
      value={`${value || ''}`.replace('.', ',')}
      variant='filled'
      error={errors[name]}
      inputProps={{ icon }}
      helperText={errors[name]?.message}
      data-testid={`${name}-field-input`}
      InputProps={{
        endAdornment: icon && <IconButton onClick={onClickOnIcon}>{icon}</IconButton>,
      }}
    />
  );
};
