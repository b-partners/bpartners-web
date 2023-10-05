import { Sync as SyncIcon } from '@mui/icons-material';
import { Badge, IconButton, SxProps, CircularProgress } from '@mui/material';
import { CalendarProvider, Redirection1 } from 'bpartners-react-client';
import { useEffect, useState } from 'react';
import { useNotify } from 'react-admin';
import { useCalendarContext } from 'src/common/store/calendar';
import { getCurrentWeek, printError, redirect } from 'src/common/utils';
import { cache, calendarEventProvider, calendarProvider, getCached } from 'src/providers';

const SYNC_BUTTON: SxProps = {
  margin: '3px 10px 0 10px',
};

const useGetCalendarSyncStatus = () => {
  const { currentCalendar } = useCalendarContext();
  const [calendarSync, setCalendarSync] = useState<boolean>(getCached.calendarSync());
  const notify = useNotify();

  useEffect(() => {
    cache.calendarSync(calendarSync);
  }, [calendarSync]);

  useEffect(() => {
    const fetch = async () => {
      const { monday, nextMonday } = getCurrentWeek();
      await calendarEventProvider.getList(1, 20, {
        calendarId: currentCalendar.id,
        start_gte: monday,
        start_lte: nextMonday,
        calendarProvider: CalendarProvider.GOOGLE_CALENDAR,
      });
      setCalendarSync(true);
    };
    fetch().catch(error => {
      if (error?.response?.status === 500) {
        notify('messages.global.error', { type: 'error' });
      }
      setCalendarSync(false);
    });
  }, [calendarSync, currentCalendar.id, notify]);

  return calendarSync;
};

export const CalendarSyncButton = () => {
  const isSynchronized = useGetCalendarSyncStatus();
  const [isLoading, setLoading] = useState(false);

  const initConsent = () => {
    const fetch = async () => {
      setLoading(true);
      const { redirectionUrl } = (await calendarProvider.oauth2Init()) as Redirection1;
      redirect(redirectionUrl);
    };
    fetch().catch(printError);
  };

  return isSynchronized ? (
    <IconButton sx={SYNC_BUTTON} disabled title='Synchroniser mon calendrier' onClick={initConsent} size='small'>
      <SyncIcon />
    </IconButton>
  ) : (
    <IconButton sx={SYNC_BUTTON} title='Synchroniser mon calendrier' onClick={initConsent} size='small'>
      <Badge variant='dot' color='warning'>
        {!isLoading ? <SyncIcon /> : <CircularProgress size='23px' sx={{ color: 'white' }} />}
      </Badge>
    </IconButton>
  );
};
