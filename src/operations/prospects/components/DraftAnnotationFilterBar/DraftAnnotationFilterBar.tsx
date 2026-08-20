import { FlexBox } from '@/common/components';
import { useDraftAnnotationFilterStore } from '@/common/store';
import { DraftAnnotationFilterKey } from '@/common/store/types';
import { draftAnnotationFilters } from '@/operations/prospects/constants';
import { CalendarMonth, Close, FilterList, Search } from '@mui/icons-material';
import { IconButton, Menu, MenuItem } from '@mui/material';
import { ChangeEvent, KeyboardEvent, MouseEvent, useMemo, useRef, useState } from 'react';
import { DraftAnnotationFilterBarStyle } from './style';

const isoDateTime = (dayOffset: number) => {
  const date = new Date();
  date.setDate(date.getDate() + dayOffset);
  return date.toISOString().slice(0, 16);
};

const defaultDateByKey: Partial<Record<DraftAnnotationFilterKey, string>> = {
  creationFrom: isoDateTime(-1),
  creationTo: isoDateTime(0),
};

export const DraftAnnotationFilterBar = () => {
  const { filters, setFilter } = useDraftAnnotationFilterStore();
  const [activeKey, setActiveKey] = useState<DraftAnnotationFilterKey | null>(null);
  const [draftValue, setDraftValue] = useState('');
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const activeFilter = useMemo(() => draftAnnotationFilters.find(filter => filter.key === activeKey), [activeKey]);
  const chips = draftAnnotationFilters.filter(filter => filter.key !== activeKey && !!filters[filter.key]);

  const openFilter = (key: DraftAnnotationFilterKey) => {
    setActiveKey(key);
    setDraftValue(filters[key] ?? defaultDateByKey[key] ?? '');
    setMenuAnchor(null);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const commitDraft = () => {
    if (activeKey && draftValue.trim()) setFilter(activeKey, draftValue.trim());
    setActiveKey(null);
    setDraftValue('');
  };

  const removeFilter = (key: DraftAnnotationFilterKey) => setFilter(key, '');

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      commitDraft();
      return;
    }
    if (event.key === 'Backspace' && draftValue === '') {
      const lastChip = chips[chips.length - 1];
      if (lastChip) removeFilter(lastChip.key);
    }
  };

  return (
    <FlexBox sx={DraftAnnotationFilterBarStyle} className='draft-filter-bar'>
      <Search className='draft-filter-search-icon' />
      {chips.map(filter => (
        <FlexBox key={filter.key} className='draft-filter-chip' data-cy={`draft-filter-chip-${filter.key}`}>
          <span className='draft-filter-chip-label'>{`${filter.label} : ${filters[filter.key]}`}</span>
          <Close className='draft-filter-chip-remove' data-cy={`draft-filter-chip-remove-${filter.key}`} onClick={() => removeFilter(filter.key)} />
        </FlexBox>
      ))}
      <input
        ref={inputRef}
        type={activeFilter?.type === 'date' ? 'datetime-local' : 'text'}
        data-cy='draft-filter-input'
        className='draft-filter-input'
        disabled={!activeKey}
        placeholder={activeFilter?.type === 'text' ? activeFilter.placeholder : undefined}
        value={draftValue}
        onChange={(event: ChangeEvent<HTMLInputElement>) => setDraftValue(event.target.value)}
        onKeyDown={handleKeyDown}
      />
      {activeFilter?.type === 'date' && (
        <IconButton data-cy='draft-filter-date-picker-button' onClick={() => inputRef.current?.showPicker?.()}>
          <CalendarMonth />
        </IconButton>
      )}
      <IconButton
        data-cy='draft-filter-menu-button'
        className='draft-filter-menu-button'
        onClick={(event: MouseEvent<HTMLElement>) => setMenuAnchor(event.currentTarget)}
      >
        <FilterList />
      </IconButton>
      <IconButton data-cy='draft-filter-search-button' className='draft-filter-search-button' onClick={commitDraft}>
        <Search />
      </IconButton>
      <Menu anchorEl={menuAnchor} open={!!menuAnchor} onClose={() => setMenuAnchor(null)}>
        {draftAnnotationFilters.map(filter => (
          <MenuItem key={filter.key} data-cy={`draft-filter-menu-item-${filter.key}`} onClick={() => openFilter(filter.key)}>
            {filter.label}
          </MenuItem>
        ))}
      </Menu>
    </FlexBox>
  );
};
