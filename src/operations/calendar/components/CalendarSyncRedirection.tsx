/* eslint-disable react-hooks/exhaustive-deps */
import { Box, CircularProgress } from '@mui/material';
import { PRIMARY_CONTAINER, SECONDARY_CONTAINER } from '../utils';
import { BP_COLOR } from 'src/bp-theme';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { getUrlParams } from 'src/common/utils';
import { useNotify } from 'react-admin';
import { cache, dataProvider, prospectingJobsProvider } from 'src/providers';
import { ProspectEvaluateJobsMapper } from 'src/providers/mappers/prospect-evaluate-jobs-mapper';

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
