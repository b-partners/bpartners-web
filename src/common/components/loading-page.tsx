import { getCached } from '@/providers';
import { Box } from '@mui/material';
import { useEffect } from 'react';
import { useNavigate } from 'react-router';

export const LoadingPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate(getCached.loadingRedirection());
  }, []);

  return <Box></Box>;
};
