import { FlexBox } from '@/common/components';
import { useProspectSearchStore } from '@/common/store';
import { Search } from '@mui/icons-material';
import { debounce } from '@mui/material';
import { ChangeEvent, FC, useMemo } from 'react';

const debounceTimeMS = 500;

export const ProspectFilterInput: FC = () => {
  const { setSearchName, searchName } = useProspectSearchStore();
  const handleChange = useMemo(() => debounce((event: ChangeEvent<HTMLInputElement>) => setSearchName(event.target.value), debounceTimeMS), []);
  return (
    <FlexBox sx={{ gap: 1, bgcolor: 'white', borderRadius: '8px', p: '10px', px: 2 }}>
      <Search />
      <input
        type='text'
        data-cy='prospect-filter'
        defaultValue={searchName}
        placeholder='Rechercher un prospect'
        onChange={handleChange}
        style={{ width: '300px', fontSize: '16px', outline: 'none', border: 'none' }}
      />
    </FlexBox>
  );
};
