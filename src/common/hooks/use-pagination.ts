/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from 'react';
import { useCookies } from 'react-cookie';
import { dataProvider } from 'src/providers';

type TFilter = {
  name: string;
  filter: any;
};

const PAGE_SIZE_EXPIRATION_TIME = 3_600;
const listSizeName = (source: string, perPage: number, filter?: string) => `bp-${source}-list-Size-filter-by-${filter || 'none'}-perPage-${perPage}`;
const setToMillisecond = (seconds: number) => seconds * 1000;
const getExpirationDate = (expire: number) => {
  const currentDate = new Date();
  currentDate.setTime(currentDate.getTime() + setToMillisecond(expire));
  return currentDate;
};

export const usePagination = (source: string, page: number, perPage: number, resourceFilter?: TFilter) => {
  const filter = resourceFilter && resourceFilter.filter;
  const cookieName = listSizeName(
    source,
    perPage,
    Object.keys(filter || {})
      .map(e => `${e}-${filter[e]}`)
      .join('-')
  );
  const lastCookieName = `last-${cookieName}`;

  const [cookies, setCookies] = useCookies([cookieName, lastCookieName]);

  useEffect(() => {
    const fetchListSize = async () => {
      const { data } = await dataProvider.getList(source, { pagination: { page: page + 1, perPage }, filter });
      if (data.length > 0) {
        setCookies(cookieName, +(cookies[cookieName] || 1) + 1, { expires: getExpirationDate(PAGE_SIZE_EXPIRATION_TIME) });
      } else {
        setCookies(lastCookieName, page, { expires: getExpirationDate(PAGE_SIZE_EXPIRATION_TIME) });
      }
    };

    if (!cookies[lastCookieName] && page === +(cookies[cookieName] || 1)) {
      fetchListSize();
    }
  }, [page, perPage, resourceFilter, source]);

  return { lastPage: +(cookies[cookieName] || 1) };
};
