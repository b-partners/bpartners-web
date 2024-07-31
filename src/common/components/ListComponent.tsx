import { Box, LinearProgress } from '@mui/material';
import { useListContext } from 'react-admin';
import { FC, ReactNode } from "react"

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
