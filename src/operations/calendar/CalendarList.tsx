import frLocale from '@fullcalendar/core/locales/fr';
import { CalendarProps, Calendar as RaCalendar } from '@react-admin/ra-calendar';
import { Calendar } from 'bpartners-react-client';
import { useEffect, useState } from 'react';
import { List, useGetList } from 'react-admin';
import { useTypedToggle } from 'src/common/hooks';
import { CalendarContextProvider } from 'src/common/store/calendar';
import { raCalendarEventCreationMapper, raCalendarEventMapper } from 'src/providers/mappers';
import { CalendarSaveDialog, CalendarSyncDialog, CalendarSyncInitPage } from './components';
import { CalendarSelection } from './components';
import { calendarIntervalFilter } from './utils';

type TypedToggle = 'CREATE' | 'EDIT';

export const CalendarList = () => {
  const { data, isLoading } = useGetList('calendar');
  const [currentCalendar, setCurrentCalendar] = useState<Calendar>(data && data[0]);
  const { getToggleStatus, setToggleStatus } = useTypedToggle<TypedToggle>({ defaultType: 'EDIT', defaultValue: false });
  const [currentEvent, setCurrentEvent] = useState<any>({});
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
      {!isLoading && !currentCalendar && <CalendarSyncInitPage />}
      {!!currentCalendar && (
        <List
          resource='calendar-event'
          filterDefaultValues={calendarIntervalFilter()}
          actions={<CalendarSelection />}
          filter={{ calendarId: currentCalendar?.id }}
          exporter={false}
          pagination={false}
        >
          <RaCalendar
            getFilterValueFromInterval={calendarIntervalFilter}
            initialView='timeGridWeek'
            editable={false}
            select={handleAddClick}
            eventClick={handleEventClick}
            locale={frLocale}
          />
          <CalendarSaveDialog title='Édition' open={getToggleStatus('EDIT')} onClose={() => setToggleStatus('EDIT')} />
          <CalendarSaveDialog title='Création' open={getToggleStatus('CREATE')} onClose={() => setToggleStatus('CREATE')} />
        </List>
      )}
      {!!currentCalendar && <CalendarSyncDialog />}
    </CalendarContextProvider>
  );
};
