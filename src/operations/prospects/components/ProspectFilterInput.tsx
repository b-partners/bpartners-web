import { useProspectSearchStore } from '@/common/store';
import { debounce, TextField } from '@mui/material';
import { ChangeEvent, useMemo } from 'react';

const debounceTimeMS = 500;

export const ProspectFilterInput = () => {
  const { setSearchName, searchName } = useProspectSearchStore();
  const handleChange = useMemo(() => debounce((event: ChangeEvent<HTMLInputElement>) => setSearchName(event.target.value), debounceTimeMS), []);
  return <TextField data-cy='prospect-filter' defaultValue={searchName} label='Rechercher un prospect' onChange={handleChange} />;
};
