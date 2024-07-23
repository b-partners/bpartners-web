import { Customer } from '@bpartners/typescript-client';
import { Box, Chip, FormHelperText, SxProps, Typography } from '@mui/material';
import { useFormContext, useWatch } from 'react-hook-form';

import { AutocompleteBackend } from '@/common/components';
import { emailValidator, FieldErrorMessage } from '@/common/resolvers';
import { AUTOCOMPLETE_LIST_LENGTH } from '@/constants';
import { customerProvider } from '@/providers';

const CHIP_CONTAINER: SxProps = {
  display: 'flex',
  justifyContent: 'flex-start',
  flexWrap: 'wrap',
  gap: 0.5,
  maxHeight: 100,
  overflowY: 'auto',
  paddingBlock: 2,
};

export const CalendarCustomerSelection = () => {
  const fetcher = async (customerListSearch: string) => customerProvider.getList(1, AUTOCOMPLETE_LIST_LENGTH, { customerListSearch });
  const customers: string[] = useWatch({ name: 'participants', defaultValue: [] });
  const {
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = useFormContext();
  const getLabel = (customer: Customer) => {
    return customer?.lastName || '';
  };

  const handleChange = (customer: Customer) => {
    if (customers.includes(customer?.email)) {
      setError('participants', { message: 'Le participant est déjà inscrit' });
    } else {
      setValue('participants', [...customers, `${customer.email}`]);
    }
  };
  const handleDelete = (titleToDelete: string) => () =>
    setValue(
      'participants',
      customers.filter(title => title !== titleToDelete)
    );

  const handleSubmit = (data: string) => {
    if (!data && data.length === 0) {
      setError('participants', { message: 'Veuillez ajouter une adresse email.' });
    } else if (!emailValidator.safeParse(data).success) {
      setError('participants', { message: FieldErrorMessage.emailNotValid });
    } else if (customers.includes(data)) {
      setError('participants', { message: 'Le participant est déjà inscrit' });
    } else {
      setValue('participants', [...customers, data]);
    }
  };

  return (
    <Box>
      <Box sx={CHIP_CONTAINER}>
        {customers.map((title: string) => (
          <Chip key={`BpMultipleTextInput-${title}`} label={title} onDelete={handleDelete(title)} />
        ))}
      </Box>
      <AutocompleteBackend
        sx={{ width: '100%' }}
        fetcher={fetcher}
        label='resources.calendar.values.participant'
        getLabel={getLabel}
        onChange={handleChange}
        onInputSubmit={handleSubmit}
        name='participants'
        onFocus={() => clearErrors('participants')}
        error={errors && !!errors['participants']}
        renderOption={(props, customer: Customer) => (
          <li {...props}>
            <Box>
              <Typography>{`${customer?.firstName} ${customer?.lastName}`}</Typography>
              <Typography color='text.secondary'>{customer?.email}</Typography>
            </Box>
          </li>
        )}
      />
      {errors && !!errors['participants'] && <FormHelperText error>{errors['participants']?.message as string}</FormHelperText>}
    </Box>
  );
};
