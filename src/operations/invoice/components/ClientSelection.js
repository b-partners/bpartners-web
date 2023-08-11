import { Autocomplete, TextField } from '@mui/material';
import { useFormContext, useWatch } from 'react-hook-form';
import { useAutocomplete } from '../../../common/hooks';
import { customerProvider } from '../../../providers';

const getClientName = customer => (customer && customer.lastName && customer.firstName ? `${customer.lastName} ${customer.firstName}` : '');

export const ClientSelection = props => {
  const { name, label, sx } = props;
  const { setValue } = useFormContext();
  const client = useWatch({ name });

  const fetcher = async q => await customerProvider.getList(1, 500, { customerListSearch: q });

  const { options, loading, onChange, query, onblur } = useAutocomplete({
    defaultValue: client,
    fetcher,
    getLabel: getClientName,
  });
  const checkError = !client;
  const errorProps = checkError && { error: true, helperText: 'Ce champ est requis' };
  const handleChange = (_event, value) => {
    setValue(name, value);
    onChange(getClientName(value));
  };

  return (
    <Autocomplete
      disablePortal
      autoComplete
      filterOptions={e => e}
      loading={loading}
      noOptionsText='Aucun élément'
      clearIcon={false}
      value={client || null}
      getOptionLabel={getClientName}
      options={options}
      inputValue={query}
      inputMode='text'
      onChange={handleChange}
      sx={{ width: 300, marginBlock: '3px', ...sx }}
      data-testid='invoice-client-selection'
      renderInput={params => <TextField {...errorProps} {...params} onBlur={onblur} value={query} onChange={q => onChange(q.target.value)} label={label} />}
    />
  );
};
