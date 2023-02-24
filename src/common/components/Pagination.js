import { Button, Toolbar, Typography } from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import { useEffect, useState } from 'react';
import { useListContext } from 'react-admin';

export const pageSize = 5;

const Pagination = () => {
  const [lastPage, setLastPage] = useState(null);
  const { data, page, isLoading, setPage } = useListContext();
  const resourcesCount = data ? data.length : 0;

  useEffect(() => {
    if (!lastPage && lastPage !== 0 && !isLoading && resourcesCount === 0 /* TODO(empty-pages): test! */) {
      setLastPage(page - 1);
      setPage(lastPage);
    }
  }, [resourcesCount]);

  if (lastPage && page === 1) {
    // react-admin redirects to page 1 if no more data to show
    // We dont't like that behavior!
    // Let the user stay on the last page.
    setPage(lastPage);
  }

  const onPrevClick = () => {
    setPage(page - 1);
    setLastPage(null);
  };

  if (isLoading) {
    return <Toolbar variant='dense' />;
  }

  return (
    <Toolbar style={{ padding: 0 }}>
      {page > 1 && (
        <Button data-testid='pagination-right-id' style={{ marginRight: 6 }} color='primary' key='prev' onClick={onPrevClick}>
          <ChevronLeft />
          Précédent
        </Button>
      )}
      {(resourcesCount === pageSize || !lastPage || page < lastPage) && (
        <Button data-testid='pagination-left-id' style={{ marginLeft: 6 }} color='primary' key='next' onClick={() => setPage(page + 1)}>
          Suivant
          <ChevronRight />
        </Button>
      )}
      <div style={{ marginLeft: 'auto' }}>
        <Typography variant='body2'>
          Page : {page} &nbsp;&nbsp;Taille : {resourcesCount}
        </Typography>
      </div>
    </Toolbar>
  );
};

export default Pagination;
