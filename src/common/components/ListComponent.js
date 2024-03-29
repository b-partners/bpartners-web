import { LinearProgress, Box } from '@mui/material';
import { useListContext } from 'react-admin';

const ListComponent = ({ children }) => {
  const { isFetching } = useListContext();

  return (
    <Box>
      {isFetching && <LinearProgress sx={{ width: 'inherit' }} color='secondary' />}
      {children}
    </Box>
  );
};

export default ListComponent;
