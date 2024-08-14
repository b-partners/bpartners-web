import { Visibility as VisibilityIcon, VisibilityOff as VisibilityOffIcon } from '@mui/icons-material';
import { IconButton, TextField } from '@mui/material';
import { ChangeEvent, FC, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { BpFormFieldProps } from './types';

const textFieldStyle = {
  marginBlock: 3,
  width: 300,
};

const passwordStyle = {
  '.MuiInputBase-root': {
    padding: 0,
  },
  '.MuiIconButton-root': {
    position: 'absolute',
    right: '0.4rem',
  },
};

// work with context, remove form in props
export const BpFormField: FC<BpFormFieldProps> = props => {
  const { name, label, type, validate, style, shouldValidate, ...others } = props;
  const {
    register,
    formState: { errors },
    setError,
  } = useFormContext();
  const record = useWatch();
  const [visibility, setVisibility] = useState(false);
  const toggleVisibility = () => setVisibility(e => !e);

  const passwordType = visibility ? 'text' : 'password';

  const dateProps = (type || '').includes('date') ? { InputLabelProps: { shrink: true } } : {};

  const errorStyle = errors[name] ? { error: true, helperText: errors[name].message as string } : { error: false };

  // if there is an specific validation other than required, it will used
  // and if shouldValidate is false, no validation will used
  const validationType = validate ? { validate: (e: ChangeEvent<HTMLInputElement>) => validate(e, record, setError) } : { required: 'Ce champ est requis' };
  const customRegister = register(name, shouldValidate !== false && validationType);

  return (
    <TextField
      sx={{ ...(style || textFieldStyle), ...(type === 'password' ? passwordStyle : {}) }}
      label={label}
      {...dateProps}
      {...errorStyle}
      {...others}
      variant='filled'
      {...customRegister}
      data-testid={`${name}-field-input`}
      type={type === 'password' ? passwordType : type}
      value={record[name] || ''}
      InputProps={{
        endAdornment: type === 'password' && (
          <IconButton aria-label='toggle password visibility' onClick={toggleVisibility}>
            {visibility ? <VisibilityOffIcon /> : <VisibilityIcon />}
          </IconButton>
        ),
      }}
    />
  );
};
