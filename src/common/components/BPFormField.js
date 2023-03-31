import { TextField } from '@mui/material';
import { useFormContext, useWatch } from 'react-hook-form';

const textFieldStyle = {
  marginBlock: 3,
  width: 300,
};

/**
 * input to use with react-hook-form only
 */
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
    watch,
    formState: { errors },
    setError,
  } = useFormContext();
  const record = useWatch();

  const dateProps = type === 'date' ? { InputLabelProps: { shrink: true } } : {};
  const errorStyle = errors[name] ? { error: true, helperText: errors[name].message } : { error: false };

  // if there is an specific validation other than required, it will used
  // and if shouldValidate is false, no validation will used
  const validationType = validate ? { validate: e => validate(e, record, setError) } : { required: 'Ce champ est requis' };
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

export default BPFormField;
