import { TextField } from '@mui/material';

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

export default BPFormField;
