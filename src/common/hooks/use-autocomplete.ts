/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useMemo, useState } from 'react';
import { debounce } from '@mui/material/utils';

type AutocompleteOptions<T> = {
  fetcher: (query: string) => Promise<T[]>;
  defaultValue: T | null;
  getLabel: (element: T) => string;
};

export const useAutocomplete = <T>(params: AutocompleteOptions<T>) => {
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
