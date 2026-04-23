import { Autocomplete, AutocompleteChangeReason, Box, TextField } from '@mui/material';
import { FC, SyntheticEvent, useRef, useState } from 'react';
import { FreeAutocompleteInputStyle } from './style';

export interface AutocompleteOption {
  id: string;
  name: string;
}

interface FreeAutocompleteInputProps {
  options: AutocompleteOption[];
  onChange: (value: string) => void;
  defaultValue?: string;
  label?: string;
  placeholder?: string;
}

const resolveDefaultInputValue = (defaultValue: string | undefined, options: AutocompleteOption[]) => {
  if (!defaultValue) return '';
  const match = options.find(o => o.id === defaultValue);
  return match ? match.name : defaultValue;
};

export const FreeAutocompleteInput: FC<FreeAutocompleteInputProps> = props => {
  const [inputValue, setInputValue] = useState(() => resolveDefaultInputValue(props.defaultValue, props.options));
  const lastEmittedRef = useRef<string | null>(null);

  const emitChange = (value: string) => {
    if (value !== lastEmittedRef.current) {
      lastEmittedRef.current = value;
      props.onChange(value);
    }
  };

  const handleAutocompleteChange = (_: SyntheticEvent, newValue: AutocompleteOption | string | null, reason: AutocompleteChangeReason) => {
    _.stopPropagation();
    if (reason === 'selectOption' || reason === 'createOption') {
      const id = typeof newValue === 'object' && newValue !== null ? newValue.id : typeof newValue === 'string' ? newValue : inputValue;
      const value = typeof newValue === 'object' && newValue !== null ? newValue.name : typeof newValue === 'string' ? newValue : inputValue;
      setInputValue(value);
      emitChange(id);
    }
  };

  const handleInputChange = (_: SyntheticEvent, newInputValue: string) => {
    _.stopPropagation();
    setInputValue(newInputValue);
  };

  const handleBlur = () => {
    const currentValue = props.options.find(({ name }) => name?.toLowerCase() === inputValue?.toLowerCase());
    emitChange(currentValue?.id || inputValue || props.defaultValue);
  };

  return (
    <Box sx={FreeAutocompleteInputStyle}>
      <Autocomplete
        freeSolo
        options={props.options}
        getOptionLabel={option => (typeof option === 'string' ? option : option.name)}
        isOptionEqualToValue={() => true}
        inputValue={inputValue}
        onChange={handleAutocompleteChange}
        onInputChange={handleInputChange}
        renderInput={params => (
          <TextField {...params} label={props.label} onClick={e => e.stopPropagation()} placeholder={props.placeholder} onBlur={handleBlur} />
        )}
      />
    </Box>
  );
};
