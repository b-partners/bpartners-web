import { TextField, IconButton } from '@mui/material';
import { VisibilityOff as VisibilityOffIcon, Visibility as VisibilityIcon } from '@mui/icons-material';
import { useFormContext, useWatch } from 'react-hook-form';
import { useState } from 'react';

const textFieldStyle = {
  marginBlock: 3,
  width: 300,
};

// input to use with react-hook-form only
const BPFormField = props => {
  const { name, label, form, type, validate, style, shouldValidate, ...others } = props;
  const {
    register,
    watch,
    formState: { errors },
  } = form;
  const dateProps = type === 'date' ? { InputLabelProps: { shrink: true } } : {};
  const errorStyle = errors[name] ? { error: true, helperText: errors[name].message } : { error: false };

  // if there is an specific validation other than required, it will used
  // and if shouldValidate is false, no validation will used
  const validationType = validate ? { validate } : { required: 'Ce champ est requis' };
  const customRegister = register(name, shouldValidate !== false && validationType);

  return (
    <TextField
      label={label}
      {...dateProps}
      {...errorStyle}
      {...others}
      variant='filled'
      {...customRegister}
      data-testid={`${name}-field-input`}
      type={type || 'text'}
      style={style || textFieldStyle}
      value={watch(name) || ''}
    />
  );
};

// work with context, remove form in props
export const BpFormField = props => {
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

  const dateProps = type === 'date' ? { InputLabelProps: { shrink: true } } : {};

  const errorStyle = errors[name] ? { error: true, helperText: errors[name].message } : { error: false };

  // if there is an specific validation other than required, it will used
  // and if shouldValidate is false, no validation will used
  const validationType = validate ? { validate: e => validate(e, record, setError) } : { required: 'Ce champ est requis' };
  const customRegister = register(name, shouldValidate !== false && validationType);

  return (
    <TextField
      sx={
        type === 'password' && {
          '.MuiInputBase-root': {
            padding: 0,
          },
          '.MuiIconButton-root': {
            position: 'absolute',
            right: '0.4rem',
          },
        }
      }
      label={label}
      {...dateProps}
      {...errorStyle}
      {...others}
      variant='filled'
      {...customRegister}
      data-testid={`${name}-field-input`}
      type={type === 'password' ? passwordType : type}
      style={style || textFieldStyle}
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

export default BPFormField;
