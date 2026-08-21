import { FlexBox } from '@/common/components';
import { useDraftAnnotationFilterStore } from '@/common/store';
import { DraftAnnotationFilterKey } from '@/common/store/types';
import { draftAnnotationFilters } from '@/operations/prospects/constants';
import { CalendarMonth, Close, FilterList, Search } from '@mui/icons-material';
import { IconButton, Menu, MenuItem, Tooltip } from '@mui/material';
import { ChangeEvent, KeyboardEvent, MouseEvent, useEffect, useMemo, useRef, useState } from 'react';
import { DraftAnnotationFilterBarStyle } from './style';

const DEFAULT_FILTER_KEY: DraftAnnotationFilterKey = 'prospectName';

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
  const [activeKey, setActiveKey] = useState<DraftAnnotationFilterKey | null>(DEFAULT_FILTER_KEY);
  const [draftValue, setDraftValue] = useState(filters[DEFAULT_FILTER_KEY] ?? '');
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

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
          <FlexBox className='draft-filter-chip-text'>
            <span className='draft-filter-chip-type'>{filter.label}</span>
            <span className='draft-filter-chip-value'>{filters[filter.key]}</span>
          </FlexBox>
          <Tooltip title='Supprimer ce filtre'>
            <Close className='draft-filter-chip-remove' data-cy={`draft-filter-chip-remove-${filter.key}`} onClick={() => removeFilter(filter.key)} />
          </Tooltip>
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
        <Tooltip title='Choisir une date et une heure'>
          <IconButton data-cy='draft-filter-date-picker-button' onClick={() => inputRef.current?.showPicker?.()}>
            <CalendarMonth />
          </IconButton>
        </Tooltip>
      )}
      <Tooltip title='Choisir un filtre'>
        <IconButton
          data-cy='draft-filter-menu-button'
          className='draft-filter-menu-button'
          onClick={(event: MouseEvent<HTMLElement>) => setMenuAnchor(event.currentTarget)}
        >
          <FilterList />
        </IconButton>
      </Tooltip>
      <Tooltip title='Rechercher'>
        <IconButton data-cy='draft-filter-search-button' className='draft-filter-search-button' onClick={commitDraft}>
          <Search />
        </IconButton>
      </Tooltip>
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
