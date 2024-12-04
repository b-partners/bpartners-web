import { Box } from '@mui/material';
import { EmptyList } from './EmptyList';

const BPErrorPage = () => {
  return (
    <Box sx={{ width: '100%' }}>
      <EmptyList content="Une erreur s'est produite" />
    </Box>
  );
};

export default BPErrorPage;
