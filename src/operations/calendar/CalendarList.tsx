import { CalendarProps, Calendar as RaCalendar, getFilterValuesFromInterval } from '@react-admin/ra-calendar';
import { useEffect, useState } from 'react';
import { List, useGetList } from 'react-admin';
import { useCheckAuth, useTypedToggle } from 'src/common/hooks';
import { calendarProvider } from 'src/providers';
import { CalendarSelection } from './components';
import { Calendar } from 'bpartners-react-client';
import frLocale from '@fullcalendar/core/locales/fr';
import { CalendarSaveDialog } from './CalendarSaveDialog';
import { CalendarEventProvider } from 'src/common/store/invoice';
import { raCalendarEventMapper } from 'src/providers/mappers';
import { dateForInput } from 'src/common/utils';

type TypedToggle = 'CREATE' | 'EDIT';

export const CalendarList = () => {
  const { data } = useGetList('calendar');
  const [currentCalendar, setCurrentCalendar] = useState<Calendar>(data && data[0]);
  const { getToggleStatus, setToggleStatus } = useTypedToggle<TypedToggle>({ defaultType: 'EDIT', defaultValue: false });
  const [currentEvent, setCurrentEvent] = useState({});
  const handleEventClick = (value: Parameters<CalendarProps['eventClick']>[0]) => {
    setCurrentEvent(raCalendarEventMapper(value));
    setToggleStatus('EDIT');
  };
  const handleAddClick = ({ end, start }: Parameters<CalendarProps['select']>[0]) => {
    setCurrentEvent({ end: dateForInput(end), start: dateForInput(start), title: 'Nouvelle évènement' });
    setToggleStatus('CREATE');
  };

  useEffect(() => {
    if (data) setCurrentCalendar(data[0]);
  }, [data]);

  return (
    <CalendarEventProvider value={currentEvent as any}>
      <List
        resource='calendar-event'
        filterDefaultValues={getFilterValuesFromInterval()}
        actions={currentCalendar && <CalendarSelection data={data} onChange={setCurrentCalendar} value={currentCalendar} />}
        filter={{ calendarId: currentCalendar?.id }}
        exporter={false}
        pagination={false}
      >
        <RaCalendar select={handleAddClick} eventClick={handleEventClick} locale={frLocale} />
        <CalendarSaveDialog
          title='Édition'
          open={getToggleStatus('EDIT')}
          calendarId={currentCalendar?.id}
          onClose={() => {
            setToggleStatus('EDIT');
          }}
        />
        <CalendarSaveDialog
          title='Création'
          open={getToggleStatus('CREATE')}
          calendarId={currentCalendar?.id}
          onClose={() => {
            setToggleStatus('CREATE');
          }}
        />
      </List>
    </CalendarEventProvider>
  );
};
