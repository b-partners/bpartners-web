import { TextField } from '@mui/material';
import { ChangeEvent } from 'react';
import { useListContext } from 'react-admin';

export const InvoiceSearchBar = () => {
  const { setFilters, filterValues } = useListContext();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newFilters = { ...filterValues, invoiceListSearch: e.target.value };
    setFilters(newFilters, newFilters, true);
  };

  return <TextField defaultValue={filterValues.invoiceListSearch} data-testid='invoice-search-bar' onChange={handleChange} label='Rechercher' />;
};
