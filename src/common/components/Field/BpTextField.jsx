import { IconButton, TextField } from '@mui/material';
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

export const BpTextField = props => {
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
