import { Box, LinearProgress } from '@mui/material';
import { FC, ReactNode } from 'react';
import { useListContext } from 'react-admin';

const ListComponent: FC<{ children: ReactNode }> = ({ children }) => {
  const { isFetching } = useListContext();

  return (
    <Box>
      {isFetching && <LinearProgress sx={{ width: 'inherit' }} color='secondary' />}
      {children}
    </Box>
  );
};

export default ListComponent;
