import { Autocomplete, CircularProgress, debounce, FormHelperText, IconButton, TextField, TextFieldProps } from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { ChangeEvent, SyntheticEvent, useMemo, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { BpAutoCompleteBackendProps } from './types';

export function BpAutoCompleteBackend<T = any>({ name, label, fetcher, textFieldProps, ...others }: BpAutoCompleteBackendProps<T>) {
  const {
    register,
    formState: { errors },
    setValue,
  } = useFormContext();
  const { mutate, data = [], isPending } = useMutation({ mutationFn: fetcher, mutationKey: [name, label] });
  const value = useWatch({ name });
  const [textFieldValue, setTextFieldValue] = useState(value);

  const deboucendMutateFn = useMemo(() => debounce(mutate, 1000), [mutate]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const currentAddressQueryValue = e.target.value;
    setTextFieldValue(currentAddressQueryValue);
    currentAddressQueryValue.length > 0 && deboucendMutateFn(currentAddressQueryValue);
  };

  const handleChange = (_event: SyntheticEvent, value: any) => setValue(name, value);
  const { onBlur, ref } = register(name);
  const error = errors[name];

  return (
    <div>
      <Autocomplete
        {...others}
        ref={ref}
        value={value}
        onBlur={onBlur}
        onChange={handleChange}
        data-testid={`${name}-auto-complete`}
        freeSolo
        filterOptions={allOptions => allOptions}
        renderInput={params => (
          <TextField
            {...({ ...params, ...textFieldProps } as TextFieldProps)}
            label={label}
            InputProps={{
              ...params.InputProps,
              endAdornment: isPending ? (
                <IconButton size='small' sx={{ position: 'absolute', right: 2, top: '50%', transform: 'translateY(-50%)' }}>
                  <CircularProgress size={25} />,
                </IconButton>
              ) : (
                params.InputProps.endAdornment
              ),
            }}
            inputProps={{
              ...params.inputProps,
            }}
            error={errors && !!errors[name]}
            value={textFieldValue}
            onChange={handleInputChange}
          />
        )}
        options={isPending ? [] : data}
        noOptionsText={isPending ? 'Recherche en cours' : 'Aucun resultat'}
      />

      {!!error && (
        <FormHelperText style={{ marginLeft: '14px' }} error>
          {error?.message as string}
        </FormHelperText>
      )}
    </div>
  );
}
