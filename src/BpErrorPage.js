import { Box } from '@mui/material';
import { EmptyList } from './operations/utils/EmptyList';

const BpErrorPage = () => {
  return (
    <Box sx={{ width: '100%' }}>
      <EmptyList content="Une erreur s'est produite" />
    </Box>
  );
};

export default BpErrorPage;
