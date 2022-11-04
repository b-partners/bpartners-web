import { Box } from '@material-ui/core';
import { LinearProgress, useListContext } from 'react-admin';

const ListComponent = ({ children }) => {
  const { isFetching } = useListContext();

  return (
    <Box>
      {isFetching && <LinearProgress sx={{ width: 'inherit' }} />}
      {children}
    </Box>
  );
};

export default ListComponent;
