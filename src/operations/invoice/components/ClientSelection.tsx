import { AutocompleteBackend } from '@/common/components';
import { AUTOCOMPLETE_LIST_LENGTH } from '@/constants';
import { Customer } from '@bpartners/typescript-client';
import { SxProps } from '@mui/material';
import { FC } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { customerProvider } from '../../../providers';

const getClientName = (customer: Customer) => (customer?.lastName && customer?.firstName ? `${customer.lastName} ${customer.firstName}` : '');

export type ClientSelectionProps = {
  name: string;
  label: string;
  sx?: SxProps;
};

export const ClientSelection: FC<ClientSelectionProps> = props => {
  const { name, label, sx = {} } = props;
  const { setValue } = useFormContext();
  const client = useWatch({ name });

  const fetcher = async (q: string) => await customerProvider.getList(1, AUTOCOMPLETE_LIST_LENGTH, { customerListSearch: q });
  const checkError = !client;
  const handleChange = (value: string) => {
    if (value) {
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
