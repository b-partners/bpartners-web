import { useAutocomplete } from '../hooks';
import { Autocomplete, SxProps, TextField, Theme } from '@mui/material';
import { ChangeEvent } from 'react';

type AutocompleteProps<T> = {
  label: string;
  sx?: SxProps<Theme>;
  fetcher: (query: string) => Promise<T[]>;
  onChange: (value: T) => void;
  getLabel: (value: T) => string;
  value: T;
  sync?: boolean;
  name: string;
  error?: boolean;
};

export function AutocompleteBackend<T extends Record<'id', string>>(props: AutocompleteProps<T>) {
  const { label, sx, fetcher, onChange: setValue, getLabel, value, name, error, sync = false } = props;

  const { options, loading, onChange, query, onblur } = useAutocomplete({
    defaultValue: value,
    fetcher,
    getLabel: getLabel,
  });
  const handleChange = (_event: any, value: any) => {
    setValue(value);
    sync && onChange(getLabel(value));
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => onChange(event.target.value);

  return (
    <Autocomplete
      disablePortal
      autoComplete
      filterOptions={e => e}
      loading={loading}
      noOptionsText='Aucun élément'
      clearIcon={false}
      value={value || null}
      getOptionLabel={e => (typeof e === 'string' ? e : getLabel(e))}
      options={options}
      inputValue={query}
      inputMode='text'
      data-testid={`autocomplete-backend-for-${name}`}
      onChange={handleChange}
      sx={{ width: 300, marginBlock: '3px', ...sx }}
      renderInput={params => <TextField {...params} error={error} onBlur={onblur} value={query} onChange={handleInputChange} label={label} />}
    />
  );
}
