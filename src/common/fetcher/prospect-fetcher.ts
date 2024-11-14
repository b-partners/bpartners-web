import { ProspectStatus } from '@bpartners/typescript-client';
import { useEffect, useState } from 'react';
import { useGetList } from 'react-admin';
import { useProspectSearchStore } from '../store';

const PROSPECT_PER_PAGE = 20;

export const useProspectFetcher = (status: ProspectStatus) => {
  const [page, setPage] = useState(1);
  const { searchName } = useProspectSearchStore();

  useEffect(() => {
    setPage(1);
  }, [searchName]);

  const {
    data: prospects = [],
    pageInfo = {},
    isFetching,
    isPending,
  } = useGetList('prospects', { pagination: { page, perPage: PROSPECT_PER_PAGE }, filter: { status, searchName } });
  const { hasNextPage, hasPreviousPage } = pageInfo;

  const nextPage = () => {
    if (hasNextPage) {
      setPage(page + 1);
    }
  };

  const prevPage = () => {
    if (hasPreviousPage) {
      setPage(page - 1);
    }
  };

  return {
    nextPage,
    prevPage,
    prospects,
    isLoading: isFetching || isPending,
    hasNextPage,
    hasPreviousPage,
    page,
  };
};
