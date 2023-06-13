import { useState } from 'react';
import { printError } from '../utils';
import { useNotify } from 'react-admin';

type Fetcher<P extends [], R> = (...args: P) => Promise<R>;

export const useFetch = <P extends [], R>(fetcher: Fetcher<P, R>, name?: string) => {
  const [{ data, isLoading }, setState] = useState<{ isLoading: boolean; data: R }>({ isLoading: false, data: null });
  const notify = useNotify();

  const trigger = (...args: P) => {
    setState({ data, isLoading: true });
    fetcher(...args)
      .then(data => {
        name && notify(`messages.global.${name}.success`);
        setState({ data, isLoading });
      })
      .catch(!name ? printError : () => notify(`messages.global.${name}.error`))
      .finally(() => setState({ data, isLoading: false }));
  };

  return { data, isLoading, trigger };
};
