/* eslint-disable react-hooks/exhaustive-deps */
import { Box, CircularProgress } from '@mui/material';
import { useEffect } from 'react';
import { useNotify } from 'react-admin';
import { useNavigate } from 'react-router-dom';
import { BP_COLOR } from '@/bp-theme';
import { getUrlParams } from '@/common/utils';
import { cache, dataProvider, prospectingJobsProvider } from '@/providers';
import { ProspectEvaluateJobsMapper } from '@/providers/mappers/prospect-evaluate-jobs-mapper';
import { PRIMARY_CONTAINER, SECONDARY_CONTAINER } from '../utils';

export const CalendarSync = () => {
  const notify = useNotify();
  const navigate = useNavigate();
  const currentDate = new Date();
  const from = currentDate;
  const to = new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000);
  const stateParam = getUrlParams(window.location.search, 'state');
  const decodedState = decodeURIComponent(stateParam);
  const calendarId = decodedState.split('=')[1];

  useEffect(() => {
    const fetchData = async () => {
      const code = getUrlParams(window.location.search, 'code');

      if (code === null) {
        notify('messages.global.error', { type: 'error' });
        navigate('/calendar');
      } else {
        try {
          await dataProvider.oauth2ExchangeToken('calendar', { code, options: calendarId });

          cache.calendarSync(true);
          transformEventCalendarToProspects();
          navigate('/calendar');
        } catch (error) {
          notify('messages.global.error', { type: 'error' });
          navigate('/calendar');
        }
      }
    };

    fetchData();
  }, []);

  const transformEventCalendarToProspects = async () => {
    // transform Calendar Event To Prospect
    const requestBody = ProspectEvaluateJobsMapper(from, to, calendarId);
    await prospectingJobsProvider.saveOrUpdate(requestBody);
  };

  return (
    <Box sx={PRIMARY_CONTAINER}>
      <Box sx={SECONDARY_CONTAINER}>
        <CircularProgress sx={{ color: BP_COLOR[10] }} />
      </Box>
    </Box>
  );
};
