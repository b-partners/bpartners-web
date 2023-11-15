/* eslint-disable react-hooks/exhaustive-deps */
import frLocale from '@fullcalendar/core/locales/fr';
import { CalendarProps, Calendar as RaCalendar } from '@react-admin/ra-calendar';
import { Calendar } from 'bpartners-react-client';
import { useEffect, useState } from 'react';
import { List, useGetList } from 'react-admin';
import { useTypedToggle } from 'src/common/hooks';
import { CalendarContextProvider } from 'src/common/store/calendar';
import { raCalendarEventCreationMapper, raCalendarEventMapper } from 'src/providers/mappers';
import { CalendarSaveDialog, CalendarSyncDialog, CalendarSyncInitPage, CalendarSelection } from './components';
import { calendarIntervalFilter } from './utils';

type TypedToggle = 'CREATE' | 'EDIT';
type TToShow = 'SYNC_PAGE' | 'CALENDAR' | 'LOADING';

export const CalendarList = () => {
  const [toShow, setToShow] = useState<TToShow>('LOADING');

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
    if (isLoading || !data || !data[0]) setToShow('SYNC_PAGE');
    else setToShow('CALENDAR');
  }, [data]);

  return (
    <CalendarContextProvider {...{ currentCalendar, currentEvent, eventList: data, setCalendar: setCurrentCalendar }}>
      {toShow === 'SYNC_PAGE' && <CalendarSyncInitPage currentCalendarId={currentCalendar?.id} />}
      {toShow === 'CALENDAR' && (
        <>
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
          <CalendarSyncDialog changeView={() => setToShow('SYNC_PAGE')} />
        </>
      )}
    </CalendarContextProvider>
  );
};
