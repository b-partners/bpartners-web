import { getCookie, setCookie } from './cookies';

export const getPaginationName = (resource: string, filters: {}, perPage: number) => `pagination-${resource}-${perPage}-${Object.keys(filters).join('-')}`;

type TFetcher = (page: number) => Promise<any[]>;
type TGetPagination = { resource: string; filters: any; page: number; perPage: number; fetcher: TFetcher };

export const getPagination = async (params: TGetPagination) => {
  const { filters, page = 1, perPage, resource, fetcher } = params;
  const currentList = await fetcher(page);
  const paginationName = getPaginationName(resource, filters, perPage);
  const lastPage = +(getCookie(paginationName) || 0);

  if (page < lastPage) {
    return {
      data: currentList,
      pageInfo: {
        hasNextPage: true,
        hasPreviousPage: page !== 1,
      },
    };
  }

  const nextPageList = await fetcher(page + 1);
  const hasNextPage = nextPageList.length > 0;
  const saveTimeDelay = 30 * 60 * 1000;

  if (hasNextPage) {
    setCookie(paginationName, `${page + 1}`, saveTimeDelay);
  }

  return {
    data: currentList,
    pageInfo: {
      hasNextPage,
      hasPreviousPage: page !== 1,
    },
  };
};
