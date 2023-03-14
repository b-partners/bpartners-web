import { useEffect, useState } from 'react';
import dataProvider, { maxPageSize } from 'src/providers/data-provider';

const listSizeName = (source: string, filter?: string) => `bp-${source}-list-Size-filter-by-${filter || 'none'}`;
const cacheListSize = (source: string, filterName: string, Size: number) => localStorage.setItem(listSizeName(source, filterName), Size.toString());
const getCachedListSize = (source: string, filterName: string) => localStorage.getItem(listSizeName(source, filterName));
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
  const name = resourceFilter && resourceFilter.name;
  const filter = resourceFilter && resourceFilter.filter;

  const [listSize, setListSize] = useState(null);
  const [paginationSize, setPaginationSize] = useState(null);

  const fetchListSize = async () => {
    const { data } = await dataProvider.getList(source, { pagination: { page: 1, perPage: maxPageSize }, filter });
    setListSize(data.length);
    cacheListSize(source, name, data.length);
  };

  useEffect(() => {
    const cachedPageSize = getCachedListSize(source, name);
    if (cachedPageSize) {
      setListSize(+cachedPageSize);
    } else {
      fetchListSize();
    }
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
