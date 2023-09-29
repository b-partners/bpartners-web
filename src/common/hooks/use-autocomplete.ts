/* eslint-disable react-hooks/exhaustive-deps */
import { debounce } from '@mui/material/utils';
import { useEffect, useMemo, useState } from 'react';

type AutocompleteOptions<T> = {
  fetcher: (query: string) => Promise<T[]>;
  defaultValue: T | null;
  getLabel: (element: T) => string;
};

export type AutocompleteController<T> = {
  onChange: (q: string) => void;
  options: T[];
  loading: boolean;
  query: string;
  setOptions: (options: T[]) => void;
  onblur: () => void;
};

export const useAutocomplete = <T>(params: AutocompleteOptions<T>): AutocompleteController<T> => {
  const { defaultValue, fetcher, getLabel } = params;

  const [query, setQuery] = useState(getLabel(defaultValue));
  const [options, setOptions] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  const onChange = (q: string) => setQuery(q);

  const fetch = useMemo(() => debounce(f => f(), 1000), []);

  useEffect(() => {
    setQuery(getLabel(defaultValue));
  }, [defaultValue]);

  useEffect(() => {
    setOptions([]);
    fetch(async () => {
      setLoading(true);
      const data = await fetcher(query);
      setLoading(false);
      setOptions(data);
    });
  }, [query, defaultValue]);

  const onblur = () => {
    if (defaultValue === null) {
      setQuery('');
    } else {
      setQuery(getLabel(defaultValue));
    }
  };

  return { onChange, options, loading, query, setOptions, onblur };
};
