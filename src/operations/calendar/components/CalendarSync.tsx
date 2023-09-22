/* eslint-disable react-hooks/exhaustive-deps */
import { Box, CircularProgress } from '@mui/material';
import { PRIMARY_CONTAINER, SECONDARY_CONTAINER } from './styles';
import { BP_COLOR } from 'src/bp-theme';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { getUrlParams } from 'src/common/utils';
import { useNotify } from 'react-admin';
import { dataProvider } from 'src/providers';

export const CalendarSync = () => {
  const notify = useNotify();
  const navigate = useNavigate();

  useEffect(() => {
    const code = getUrlParams(window.location.search, 'code');

    if (code === null) {
      notify('messages.global.error', { type: 'error' });
      navigate('/calendar');
    } else {
      dataProvider
        .oauth2ExchangeToken('calendar', { code })
        .catch(() => notify('messages.global.error', { type: 'error' }))
        .finally(() => navigate('/calendar'));
    }
  }, []);

  return (
    <Box sx={PRIMARY_CONTAINER}>
      <Box sx={SECONDARY_CONTAINER}>
        <CircularProgress sx={{ color: BP_COLOR[10] }} />
      </Box>
    </Box>
  );
};
