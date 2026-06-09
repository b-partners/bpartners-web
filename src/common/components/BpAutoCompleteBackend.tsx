import { Autocomplete, CircularProgress, debounce, FormHelperText, IconButton, TextField, TextFieldProps } from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { SyntheticEvent, useEffect, useMemo, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { BpAutoCompleteBackendProps } from './types';

export function BpAutoCompleteBackend<T = any>({ name, label, fetcher, textFieldProps, ...others }: BpAutoCompleteBackendProps<T>) {
  const {
    register,
    formState: { errors },
    setValue,
    watch,
  } = useFormContext();
  const { mutate, data = [], isPending } = useMutation({ mutationFn: fetcher, mutationKey: [name, label] });
  const value = watch(name) ?? '';

  const [inputValue, setInputValue] = useState<string>(typeof value === 'string' ? value : '');

  useEffect(() => {
    setInputValue(typeof value === 'string' ? value : '');
  }, [value]);

  const debouncedMutateFn = useMemo(() => debounce(mutate, 200), [mutate]);

  const { onBlur, ref } = register(name);
  const error = errors[name];

  const handleChange = (_event: SyntheticEvent, newValue: any) => {
    setValue(name, newValue);
  };

  const handleInputChange = (_event: SyntheticEvent, newInputValue: string) => {
    setInputValue(newInputValue);
    newInputValue.length > 0 && debouncedMutateFn(newInputValue);
  };

  const customOnBlur: typeof onBlur = event => {
    if (inputValue !== value) setValue(name, inputValue);
    return onBlur(event);
  };

  return (
    <div>
      <Autocomplete
        {...others}
        value={value}
        inputValue={inputValue}
        onChange={handleChange}
        onInputChange={handleInputChange}
        data-testid={`${name}-auto-complete`}
        freeSolo
        filterOptions={allOptions => allOptions}
        renderInput={params => (
          <TextField
            {...({ ...params, ...textFieldProps } as TextFieldProps)}
            label={label}
            InputProps={{
              ...{ ...params.InputProps, ...textFieldProps?.InputProps },
              endAdornment: isPending ? (
                <IconButton size='small' sx={{ position: 'absolute', right: 2, top: '50%', transform: 'translateY(-50%)' }}>
                  <CircularProgress size={25} />,
                </IconButton>
              ) : (
                params.InputProps.endAdornment
              ),
            }}
            error={errors && !!errors[name]}
            ref={ref}
            onBlur={customOnBlur}
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
