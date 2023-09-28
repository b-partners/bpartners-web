import { Badge, Box, IconButton, SxProps } from '@mui/material';
import { Sync } from '@mui/icons-material';
import { CalendarProvider, Redirection1 } from 'bpartners-react-client';
import { useEffect, useState } from 'react';
import { useCalendarContext } from 'src/common/store';
import { cache, calendarEventProvider, calendarProvider, getCached } from 'src/providers';
import { CalendarSelection } from './CalendarSelection';
import { printError, redirect } from 'src/common/utils';

const CONTAINER: SxProps = {
  width: 'fit-content',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-around',
};

const SYNC_BUTTON: SxProps = {
  margin: '3px 10px 0 10px',
};

const useGetCalendarSyncStatus = () => {
  const { currentCalendar } = useCalendarContext();
  const [calendarSync, setCalendarSync] = useState<boolean>(getCached.calendarSync());

  useEffect(() => {
    cache.calendarSync(calendarSync);
  }, [calendarSync]);

  useEffect(() => {
    if (!calendarSync) {
      try {
        calendarEventProvider.getList(1, 20, { calendarId: currentCalendar.id, calendarProvider: CalendarProvider.GOOGLE_CALENDAR });
      } catch {
        setCalendarSync(false);
      }
    }
  }, [calendarSync, currentCalendar.id]);

  return calendarSync;
};

export const CalendarListAction = () => {
  const isSynchronized = useGetCalendarSyncStatus();

  const initConsent = () => {
    const fetch = async () => {
      const { redirectionUrl } = (await calendarProvider.oauth2Init()) as Redirection1;
      redirect(redirectionUrl);
    };
    fetch().catch(printError);
  };

  return (
    <Box sx={CONTAINER}>
      <CalendarSelection />
      <IconButton sx={SYNC_BUTTON} disabled={isSynchronized} title='Synchroniser mon calendrier' onClick={initConsent}>
        <Sync />
      </IconButton>
    </Box>
  );
};
