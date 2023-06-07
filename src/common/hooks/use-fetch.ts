import { useState } from 'react';
import { printError } from '../utils';

type TState<R extends string> = {
  loading: Record<R, boolean>;
  data: Record<R, any>;
};

/**
 * Handle the fetch action with the loading state
 *
 * Return loading: the loading state null or {[resource]: boolean}
 * Return data: the loading state null or {[resource]: any}
 * Return fetch: function to start the request
 *
 * @returns the data, the function to fetch the data and the loading state
 */
export const useFetch = <R extends string = string>() => {
  const [{ loading, data }, setState] = useState<TState<R>>({ loading: null, data: null });

  const setLoading = (resource: R, value: boolean) => setState({ data, loading: { ...loading, [resource]: value } });
  const setData = (resource: R, value: any) => setState({ data: { ...data, [resource]: value }, loading });
  const startLoading = (resource: R) => setLoading(resource, true);

  /**
   * Function that start the request
   * @param resource the name of the request
   * @param request the function that do the request
   * @param errorHandling Nor required but it is the function to call if the request failed
   */
  const fetch =
    (resource: R, request: (...args: unknown[]) => Promise<unknown>, errorHandling?: (err: unknown) => void) =>
    (...args: Parameters<typeof request>): void => {
      const endAction = () => {
        setState({ loading: { ...loading, [resource]: false }, data: { ...data, [resource]: null } });
      };

      startLoading(resource);
      request(...args)
        .then(res => setData(resource, res))
        .catch(errorHandling || printError)
        .finally(endAction);
    };

  return { loading, data, fetch };
};
