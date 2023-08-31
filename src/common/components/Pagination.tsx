import { Toolbar, Typography, IconButton, Box } from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import { useListContext } from 'react-admin';
import { FC } from 'react';
import { usePagination } from '../hooks';

export const pageSize = 15;

//TODO: set it again later
//const pageSizeList = [10, 15, 30, 50];

const Pagination: FC<any> = props => {
  const { filter, name } = props;
  const { page, isLoading, setPage, perPage, resource } = useListContext();
  const { lastPage } = usePagination(resource, page, perPage, filter && { filter, name });

  if (isLoading) {
    return <Toolbar variant='dense' />;
  }

  return (
    <Toolbar sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Box>
        <IconButton
          disabled={page === 1}
          data-testid='pagination-right-id'
          style={{ marginRight: 6 }}
          color='primary'
          key='prev'
          onClick={() => setPage(page - 1)}
        >
          <ChevronLeft />
        </IconButton>
        <IconButton
          disabled={page === lastPage}
          data-testid='pagination-left-id'
          style={{ marginLeft: 6 }}
          color='primary'
          key='next'
          onClick={() => setPage(page + 1)}
        >
          <ChevronRight />
        </IconButton>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', height: '100%' }}>
        <Typography sx={{ marginRight: 1 }} variant='body1'>
          Page : {page}
        </Typography>
        <Typography sx={{ marginInline: 1 }} variant='body1'>
          Taille : 15
        </Typography>
      </Box>
    </Toolbar>
  );
};
export default Pagination;
