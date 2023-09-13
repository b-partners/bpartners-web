import { Calendar, getFilterValuesFromInterval } from '@react-admin/ra-calendar';
import { List, Loading } from 'react-admin';
import { useCheckAuth } from 'src/common/hooks';
import { calendarProvider } from 'src/providers';
import { CalendarSynchronisation } from './components';

export const CalendarList = () => {
  const fetcher = async () => calendarProvider.getList(1, 500, {});
  const { isAuthenticated, isLoading } = useCheckAuth(fetcher);

  return (
    <>
      {isLoading && <Loading />}
      {!isLoading && isAuthenticated && (
        <List exporter={false} pagination={false}>
          <Calendar />
        </List>
      )}
      {!isLoading && !isAuthenticated && <CalendarSynchronisation />}
    </>
  );
};
