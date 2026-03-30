import { Redirect } from '@/common/utils';
import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';

export const bpQueryClient = new QueryClient({
  queryCache: new QueryCache({
    onError(error: any) {
      if (error?.status === 403) {
        Redirect.toURL(`${location.hostname}/login`);
      }
    },
  }),
  mutationCache: new MutationCache({
    onError(error: any) {
      if (error?.status === 403) {
        Redirect.toURL(`${location.hostname}/login`);
      }
    },
  }),
});
