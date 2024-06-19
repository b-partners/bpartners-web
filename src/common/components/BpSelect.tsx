import { FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material';

interface DynamicSelectProps<T> {
  value: string;
  handleChange: (e: SelectChangeEvent<string>) => Promise<void>;
  loading?: boolean;
  options: T[];
  getOptionKey: (option: T) => string;
  getOptionValue: (option: T) => string;
  getOptionLabel: (option: T) => string;
  label: string;
}

const BpSelect = <T,>({ value, handleChange, loading, options, getOptionKey, getOptionValue, getOptionLabel, label }: DynamicSelectProps<T>) => {
  return (
    <FormControl sx={{ minWidth: 200, mr: 1 }}>
      <InputLabel id='dynamic-select-label'>{label}</InputLabel>
      <Select labelId='dynamic-select-label' id='dynamic-select' value={value} label={label} onChange={handleChange}>
        {loading ? (
          <MenuItem disabled>Chargement en cours...</MenuItem>
        ) : (
          options.map(option => (
            <MenuItem key={getOptionKey(option)} value={getOptionValue(option)}>
              {getOptionLabel(option)}
            </MenuItem>
          ))
        )}
      </Select>
    </FormControl>
  );
};

export default BpSelect;
