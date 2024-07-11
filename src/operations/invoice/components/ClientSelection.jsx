import { useFormContext, useWatch } from 'react-hook-form';
import { AutocompleteBackend } from 'src/common/components';
import { AUTOCOMPLETE_LIST_LENGTH } from 'src/constants';
import { customerProvider } from '../../../providers';

const getClientName = customer => (customer && customer.lastName && customer.firstName ? `${customer.lastName} ${customer.firstName}` : '');

export const ClientSelection = props => {
  const { name, label, sx } = props;
  const { setValue } = useFormContext();
  const client = useWatch({ name });

  const fetcher = async q => await customerProvider.getList(1, AUTOCOMPLETE_LIST_LENGTH, { customerListSearch: q });
  const checkError = !client;
  const handleChange = value => {
    if (!!value) {
      setValue(name, value);
    }
  };

  return (
    <AutocompleteBackend
      fetcher={fetcher}
      getLabel={getClientName}
      label={label}
      name={name}
      onChange={handleChange}
      value={client}
      error={checkError}
      sync={true}
      sx={{ width: 300, marginBlock: '3px', ...sx }}
    />
  );
};
