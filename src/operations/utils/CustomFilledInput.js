import { TextField } from '@mui/material';

const textFieldStyle = {
  marginBlock: 3,
  width: 300,
};

/**
 * input to use with react-hook-form only
 */
const CustomFilledInput = props => {
  const { name, label, formValidator, type, validate, style } = props;
  const {
    register,
    watch,
    formState: { errors },
  } = formValidator;
  const dateProps = type === 'date' ? { InputLabelProps: { shrink: true } } : {};
  const errorStyle = errors[name] ? { error: true, helperText: errors[name].message } : { error: false };

  return (
    <TextField
      label={label}
      {...dateProps}
      {...errorStyle}
      variant='filled'
      type={type || 'text'}
      style={style || textFieldStyle}
      value={watch(name) || ''}
      {...register(name, validate ? { validate } : { required: 'Ce champ est requis' })}
    />
  );
};

export default CustomFilledInput;
