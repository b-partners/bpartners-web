import { useSearchParams } from 'react-router-dom';

export const getUrlParams = (search: string, key: string) => new URLSearchParams(search).get(key);
export const parseUrlParams = () => Object.fromEntries(new URLSearchParams(window.location.search)); // * example : const {key, key2} = parseUrlParams();

export const useWrappedSearchParams = <T extends string>(keys: T[]) => {
  const [p] = useSearchParams();

  return keys.reduce(
    (acc, key) => ({
      ...acc,
      [key]: p.get(key),
    }),
    {} as Record<T, string | null>
  );
};
