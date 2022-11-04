import { LinearProgress, Box } from '@material-ui/core';
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
