import { CalendarProps, Calendar as RaCalendar, getFilterValuesFromInterval } from '@react-admin/ra-calendar';
import { useEffect, useState } from 'react';
import { List, useGetList } from 'react-admin';
import { useTypedToggle } from 'src/common/hooks';
import { CalendarSelection } from './components';
import { Calendar } from 'bpartners-react-client';
import frLocale from '@fullcalendar/core/locales/fr';
import { CalendarSaveDialog } from './CalendarSaveDialog';
import { TRaCalendarEvent, raCalendarEventCreationMapper, raCalendarEventMapper } from 'src/providers/mappers';
import { CalendarContextProvider } from 'src/common/store';

type TypedToggle = 'CREATE' | 'EDIT';

export const CalendarList = () => {
  const { data } = useGetList('calendar');
  const [currentCalendar, setCurrentCalendar] = useState<Calendar>(data && data[0]);
  const { getToggleStatus, setToggleStatus } = useTypedToggle<TypedToggle>({ defaultType: 'EDIT', defaultValue: false });
  const [currentEvent, setCurrentEvent] = useState<TRaCalendarEvent>(null);
  const handleEventClick = (value: Parameters<CalendarProps['eventClick']>[0]) => {
    setCurrentEvent(raCalendarEventMapper(value));
    setToggleStatus('EDIT');
  };
  const handleAddClick = ({ end, start }: Parameters<CalendarProps['select']>[0]) => {
    setCurrentEvent(raCalendarEventCreationMapper({ end, start }));
    setToggleStatus('CREATE');
  };

  useEffect(() => {
    if (data) setCurrentCalendar(data[0]);
  }, [data]);

  return (
    <CalendarContextProvider {...{ currentCalendar, currentEvent, eventList: data }}>
      <List
        resource='calendar-event'
        filterDefaultValues={getFilterValuesFromInterval()}
        actions={currentCalendar && <CalendarSelection onChange={setCurrentCalendar} value={currentCalendar} />}
        filter={{ calendarId: currentCalendar?.id }}
        exporter={false}
        pagination={false}
      >
        <RaCalendar initialView='timeGridWeek' editable={false} select={handleAddClick} eventClick={handleEventClick} locale={frLocale} />
        <CalendarSaveDialog title='Édition' open={getToggleStatus('EDIT')} onClose={() => setToggleStatus('EDIT')} />
        <CalendarSaveDialog title='Création' open={getToggleStatus('CREATE')} onClose={() => setToggleStatus('CREATE')} />
      </List>
    </CalendarContextProvider>
  );
};
