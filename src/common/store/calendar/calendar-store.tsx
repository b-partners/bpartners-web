import { Calendar, CalendarEvent } from '@bpartners/typescript-client';
import { createContext, FC, ReactNode, useContext } from 'react';
import { useTypedToggle } from 'src/common/hooks';
import { TRaCalendarEvent } from 'src/providers/mappers';

export type CalendarDialogToggle = 'CREATE' | 'EDIT';

type RaCalendarContext = {
  children?: ReactNode;
  currentEvent: TRaCalendarEvent;
  currentCalendar: Calendar;
  eventList: CalendarEvent[];
  setCalendar?: (calendar: Calendar) => void;
  dialog?: {
    getDialogStatus: (value: CalendarDialogToggle) => boolean;
    setDialogStatus: (value: CalendarDialogToggle) => void;
  };
};

const CalendarContext = createContext<RaCalendarContext>(null);
export const useCalendarContext = () => useContext(CalendarContext);

export const CalendarContextProvider: FC<RaCalendarContext> = ({ currentCalendar, currentEvent, eventList, children, setCalendar }) => {
  const { getToggleStatus: getDialogStatus, setToggleStatus: setDialogStatus } = useTypedToggle<CalendarDialogToggle>({
    defaultType: 'EDIT',
    defaultValue: false,
  });

  return (
    <CalendarContext.Provider value={{ currentCalendar, currentEvent, eventList, setCalendar, dialog: { getDialogStatus, setDialogStatus } }}>
      {children}
    </CalendarContext.Provider>
  );
};
