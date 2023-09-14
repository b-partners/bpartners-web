import { Calendar as RaCalendar } from '@react-admin/ra-calendar';
import { useState } from 'react';
import { List, Loading, useGetList } from 'react-admin';
import { useCheckAuth } from 'src/common/hooks';
import { calendarProvider } from 'src/providers';
import { CalendarSelection, CalendarSynchronisation } from './components';
import { Calendar } from 'bpartners-react-client';

export const CalendarList = () => {
  const { isAuthenticated, isLoading } = useCheckAuth(async () => calendarProvider.getList(1, 500, {}));
  const { data } = useGetList('calendar');
  const [currentCalendar, setCurrentCalendar] = useState<Calendar>(data && data[0]);
  return (
    <>
      {isLoading && <Loading />}
      {!isLoading && isAuthenticated && (
        <List
          actions={<CalendarSelection data={data} onChange={setCurrentCalendar} value={currentCalendar} />}
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
