import { AutocompleteController, useAutocomplete } from '../hooks';
import { Autocomplete, SxProps, TextField, Theme, AutocompleteRenderOptionState } from '@mui/material';
import { ChangeEvent, FormEvent, HTMLAttributes, ReactNode } from 'react';
import { useTranslate } from 'react-admin';

type AutocompleteProps<T> = {
  label: string;
  sx?: SxProps<Theme>;
  fetcher: (query: string) => Promise<T[]>;
  onChange: (value: T) => void;
  getLabel?: (value: T) => string;
  value?: T;
  sync?: boolean;
  name: string;
  error?: boolean;
  autocompleteController?: AutocompleteController<T>;
  renderOption?: (props: HTMLAttributes<HTMLLIElement>, option: T, state: AutocompleteRenderOptionState) => ReactNode;
  onInputSubmit?: (data: string) => void;
} & Omit<HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onSubmit' | 'onChange'>;

export function AutocompleteBackend<T extends Record<'id', string>>(props: AutocompleteProps<T>) {
  const {
    label,
    sx,
    fetcher,
    onChange: setValue,
    getLabel,
    value,
    name,
    error,
    sync = false,
    renderOption,
    autocompleteController,
    onInputSubmit,
    ...others
  } = props;
  const translate = useTranslate();

  const { options, loading, onChange, query, onblur } = useAutocomplete<T>({
    defaultValue: value,
    fetcher,
    getLabel: getLabel,
  });

  const handleChange = (_event: any, value: any) => {
    setValue(value);
    sync && onChange(getLabel(value));
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => onChange(event.target.value);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    event.stopPropagation();
    !!onInputSubmit && onInputSubmit(query);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Autocomplete
        filterOptions={e => e}
        loading={loading}
        noOptionsText='Aucun élément'
        clearIcon={false}
        value={value || null}
        getOptionLabel={e => (typeof e === 'string' ? e : getLabel ? getLabel(e) : undefined)}
        options={options}
        inputValue={query}
        inputMode='text'
        data-testid={`autocomplete-backend-for-${name}`}
        onChange={handleChange}
        sx={{ width: 300, marginBlock: '3px', ...sx }}
        renderInput={params => (
          <TextField {...params} error={error} onBlur={onblur} value={query} onChange={handleInputChange} label={translate(label, { smart_count: 2 })} />
        )}
        {...others}
        renderOption={renderOption}
      />
    </form>
  );
}
