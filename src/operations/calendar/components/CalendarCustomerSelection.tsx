import { Box, Chip, SxProps, Typography, FormHelperText } from '@mui/material';
import { Customer } from 'bpartners-react-client';
import { FormEvent } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

import { AutocompleteBackend } from 'src/common/components';
import { useAutocomplete } from 'src/common/hooks';
import { FieldErrorMessage, emailValidator } from 'src/common/resolvers';
import { AUTOCOMPLETE_LIST_LENGTH } from 'src/constants';
import { customerProvider } from 'src/providers';

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

  const autocompleteController = useAutocomplete({
    defaultValue: { firstName: '', lastName: '', email: '' },
    fetcher,
    getLabel: getLabel,
  });

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

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!autocompleteController.query && autocompleteController.query.length === 0) {
      setError('participants', { message: 'Veuillez ajouter une adresse email.' });
    } else if (!emailValidator.safeParse(autocompleteController.query).success) {
      setError('participants', { message: FieldErrorMessage.emailNotValid });
    } else if (customers.includes(autocompleteController.query)) {
      setError('participants', { message: 'Le participant est déjà inscrit' });
    } else {
      setValue('participants', [...customers, autocompleteController.query]);
      autocompleteController.onChange('');
    }
  };

  return (
    <Box>
      <Box sx={CHIP_CONTAINER}>
        {customers.map((title: string) => (
          <Chip key={`BpMultipleTextInput-${title}`} label={title} onDelete={handleDelete(title)} />
        ))}
      </Box>
      <form onSubmit={handleSubmit}>
        <AutocompleteBackend
          sx={{ width: '100%' }}
          fetcher={fetcher}
          autocompleteController={autocompleteController}
          label='resources.calendar.values.participant'
          getLabel={getLabel}
          onChange={handleChange}
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
        {errors && !!errors['participants'] && <FormHelperText error>{errors['participants']?.message}</FormHelperText>}
      </form>
    </Box>
  );
};
