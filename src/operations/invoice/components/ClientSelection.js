import { TextField, Autocomplete } from '@mui/material';
import { useGetList } from 'react-admin';
import { useFormContext, useWatch } from 'react-hook-form';

const getClientName = customer => (customer && customer.lastName && customer.firstName ? `${customer.lastName} ${customer.firstName}` : '');

export const ClientSelection = props => {
  const { name, label, sx } = props;
  const { setValue } = useFormContext();

  const client = useWatch({ name });

  const { data: clients = [], isLoading, error } = useGetList('customers', { pagination: { page: 1, perPage: 500 } });
  const checkError = !client || error;
  const errorProps = checkError && { error: true, helperText: 'Ce champ est requis' };
  const handleChange = (_event, value) => setValue(name, value);

  console.log(client);

  return (
    <Autocomplete
      disablePortal
      noOptionsText='Aucun élément'
      clearIcon={false}
      value={client || {}}
      loading={isLoading}
      getOptionLabel={getClientName}
      options={clients}
      onChange={handleChange}
      sx={{ width: 300, marginBlock: '3px', ...sx }}
      data-testid='invoice-client-selection'
      renderInput={params => <TextField {...errorProps} {...params} label={label} />}
    />
  );
};
