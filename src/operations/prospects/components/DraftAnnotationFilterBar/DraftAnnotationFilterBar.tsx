import { FlexBox } from '@/common/components';
import { useDraftAnnotationFilterStore } from '@/common/store';
import { draftAnnotationFilters } from '@/operations/prospects/constants';
import { CalendarMonth, Search } from '@mui/icons-material';
import { debounce } from '@mui/material';
import { ChangeEvent, useMemo } from 'react';
import { DraftAnnotationFilterBarStyle } from './style';

const debounceTimeMS = 500;

export const DraftAnnotationFilterBar = () => {
  const { filters, setFilter } = useDraftAnnotationFilterStore();

  const debouncedSetters = useMemo(
    () => Object.fromEntries(draftAnnotationFilters.map(filter => [filter.key, debounce((value: string) => setFilter(filter.key, value), debounceTimeMS)])),
    [setFilter]
  );

  return (
    <FlexBox sx={DraftAnnotationFilterBarStyle}>
      {draftAnnotationFilters.map(filter => (
        <FlexBox key={filter.key} className='draft-filter-item'>
          {filter.type === 'date' ? <CalendarMonth /> : <Search />}
          <input
            type={filter.type === 'date' ? 'date' : 'text'}
            data-cy={`draft-filter-${filter.key}`}
            defaultValue={filters[filter.key] ?? ''}
            placeholder={filter.type === 'text' ? filter.label : undefined}
            onChange={(event: ChangeEvent<HTMLInputElement>) => debouncedSetters[filter.key](event.target.value)}
            className='draft-filter-input'
          />
        </FlexBox>
      ))}
    </FlexBox>
  );
};
