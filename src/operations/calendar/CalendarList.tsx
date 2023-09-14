import { Calendar } from '@react-admin/ra-calendar';
import { useState } from 'react';
import { List, Loading } from 'react-admin';
import { useCheckAuth } from 'src/common/hooks';
import { calendarProvider } from 'src/providers';
import { CalendarSelection, CalendarSynchronisation } from './components';

export const CalendarList = () => {
  const { isAuthenticated, isLoading } = useCheckAuth(async () => calendarProvider.getList(1, 500, {}));
  const [currentCalendar, setCurrentCalendar] = useState();

  return (
    <>
      {isLoading && <Loading />}
      {!isLoading && isAuthenticated && (
        <List
          actions={<CalendarSelection onChange={setCurrentCalendar} value={currentCalendar} />}
          filter={{ calendarId: currentCalendar?.id }}
          exporter={false}
          pagination={false}
        >
          <Calendar />
        </List>
      )}
      {!isLoading && !isAuthenticated && <CalendarSynchronisation />}
    </>
  );
};
