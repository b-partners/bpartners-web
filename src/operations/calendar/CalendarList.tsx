import { Calendar as RaCalendar } from '@react-admin/ra-calendar';
import { useEffect, useState } from 'react';
import { List, Loading, useGetList } from 'react-admin';
import { useCheckAuth } from 'src/common/hooks';
import { calendarProvider } from 'src/providers';
import { CalendarSelection, CalendarSynchronisation } from './components';
import { Calendar } from 'bpartners-react-client';

export const CalendarList = () => {
  const { isAuthenticated, isLoading } = useCheckAuth(async () => calendarProvider.getList(1, 500, {}));
  const { data, isLoading: isGetCalendarLoading } = useGetList('calendar');
  const [currentCalendar, setCurrentCalendar] = useState<Calendar>(data && data[0]);

  useEffect(() => {
    if (data) setCurrentCalendar(data[0]);
  }, [data]);

  return (
    <>
      {/* loading on check if oauth token is valid wait to get the list of user's calendar */}
      {(isLoading || isGetCalendarLoading) && <Loading />}
      {!isLoading && !isGetCalendarLoading && currentCalendar && isAuthenticated && (
        <List
          actions={currentCalendar && <CalendarSelection data={data} onChange={setCurrentCalendar} value={currentCalendar} />}
          filter={{ calendarId: currentCalendar?.id }}
          exporter={false}
          pagination={false}
        >
          <RaCalendar />
        </List>
      )}
      {!isLoading && !isAuthenticated && <CalendarSynchronisation />}
    </>
  );
};
