import { Box } from '@mui/material';
import { FC, useEffect } from 'react';
import { sentryErrorLogger } from '../utils';
import { EmptyList } from './EmptyList';

const BPErrorPage: FC<any> = ({ error }) => {
  useEffect(() => {
    sentryErrorLogger(error.message, { error });
  }, [error]);

  return (
    <Box sx={{ width: '100%' }}>
      <EmptyList content="Une erreur s'est produite" />
    </Box>
  );
};

export default BPErrorPage;
