import { Toolbar, Typography, IconButton, Box, TextField, MenuItem } from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import { useListContext } from 'react-admin';
import useGetPaginationCount from '../hooks/use-get-pagination-count';

export const pageSize = 15;

const pageSizeList = [10, 15, 30, 50];

const Pagination = props => {
  const { filter, name } = props;
  const { page, isLoading, setPage, perPage, setPerPage, resource } = useListContext();
  const { paginationSize } = useGetPaginationCount(resource, perPage, filter && { filter, name });

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
          disabled={page === paginationSize}
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
          Page : {page} / {paginationSize}
        </Typography>
        <Typography sx={{ marginInline: 1 }} variant='body1'>
          Taille :
        </Typography>
        <TextField select sx={{ width: 70, position: 'relative', bottom: 2 }} value={perPage} variant='outlined' type='number'>
          {pageSizeList.map(option => (
            <MenuItem key={`pageSize-${option}`} onClick={() => setPerPage(option)} value={option}>
              {option}
            </MenuItem>
          ))}
        </TextField>
      </Box>
    </Toolbar>
  );
};

export default Pagination;
