import { TextField } from '@mui/material';
import { useListContext } from 'react-admin';

export const ProspectFilterInput = () => {
  const { setFilters, filterValues } = useListContext();
  return (
    <TextField
      data-cy='prospect-filter'
      defaultValue={filterValues.searchName}
      label='Rechercher un prospect'
      onChange={e => setFilters({ searchName: e.target.value }, { searchName: e.target.value }, true)}
    />
  );
};
