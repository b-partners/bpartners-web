import { Box } from '@mui/material';
import { ComponentType, useEffect } from 'react';
import { ErrorProps } from 'react-admin';
import { sentryErrorLogger } from '../utils';
import { EmptyList } from './EmptyList';

const BPErrorPage: ComponentType<ErrorProps> = ({ error }) => {
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
