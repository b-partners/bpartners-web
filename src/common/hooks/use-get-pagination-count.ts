import { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import { dataProvider, maxPageSize } from 'src/providers';

const PAGE_SIZE_EXPIRATION_TIME = 3_000;

const listSizeName = (source: string, filter?: string) => `bp-${source}-list-Size-filter-by-${filter || 'none'}`;
const setToMillisecond = (seconds: number) => seconds * 1000;
const getExpirationDate = (expire: number) => {
  const currentDate = new Date();
  currentDate.setTime(currentDate.getTime() + setToMillisecond(expire));
  return currentDate;
};

const lastPageCalculus = (listSize: number, perPage: number) => {
  let lastPage = Math.floor(listSize / perPage);
  if (listSize % perPage !== 0) {
    lastPage++;
  }
  return lastPage;
};

type TFilter = {
  name: string;
  filter: any;
};

const useGetPaginationCount = (source: string, perPage: number, resourceFilter?: TFilter) => {
  const filter = resourceFilter && resourceFilter.filter;
  const cookieName = listSizeName(
    source,
    Object.keys(filter || {})
      .map(e => `${e}-${filter[e]}`)
      .join('-')
  );
  const [cookies, setCookies] = useCookies([cookieName]);

  const [listSize, setListSize] = useState(null);
  const [paginationSize, setPaginationSize] = useState(null);

  const fetchListSize = async () => {
    const { data } = await dataProvider.getList(source, { pagination: { page: 1, perPage: maxPageSize }, filter });
    setListSize(data.length);
    setCookies(cookieName, data.length, { expires: getExpirationDate(PAGE_SIZE_EXPIRATION_TIME) });
  };

  useEffect(() => {
    const cachedPageSize = cookies[cookieName];
    if (cachedPageSize) {
      setListSize(+cachedPageSize);
    } else {
      fetchListSize().catch(err => console.error(err));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (listSize && perPage) {
      const lastPage = lastPageCalculus(listSize, perPage);
      setPaginationSize(lastPage);
    }
  }, [listSize, perPage]);

  return { fetchListSize, paginationSize };
};

export default useGetPaginationCount;
