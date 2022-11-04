import { useState } from 'react';
import { useListContext } from 'react-admin';

import { Button, Toolbar, Typography } from '@material-ui/core';
import ChevronLeft from '@material-ui/icons/ChevronLeft';
import ChevronRight from '@material-ui/icons/ChevronRight';

export const pageSize = 5;

const haSetPerPage = (setPerPage, setPage, page) => {
  setPerPage(pageSize);
  setPage(page); // setPage has to be called after setPerPage, otherwise react-admin fails...
};

const PrevNextPagination = () => {
  var [lastPage, setLastPage] = useState(null);
  const { page, data, isLoading, setPage, setPerPage } = useListContext();
  haSetPerPage(setPerPage, setPage, page);
  const resourcesCount = data ? Object.keys(data).length : 0;
  if (!lastPage && lastPage !== 0 /* TODO(empty-pages): test! */ && !isLoading && resourcesCount === 0) {
    lastPage = page - 1;
    setLastPage(lastPage);
    setPage(lastPage);
  }
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
  return !isLoading ? (
    <Toolbar>
      {page > 1 && (
        <Button style={{ marginRight: 6 }} color='primary' key='prev' onClick={onPrevClick}>
          <ChevronLeft />
          Précédent
        </Button>
      )}
      {(resourcesCount === pageSize || !lastPage || page < lastPage) && (
        <Button style={{ marginLeft: 6 }} color='primary' key='next' onClick={() => setPage(page + 1)}>
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
  ) : (
    <></>
  );
};

export default PrevNextPagination;
