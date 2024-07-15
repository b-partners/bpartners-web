import { useTypedToggle } from '@/common/hooks';
import { TRaCalendarEvent } from '@/providers/mappers';
import { Calendar, CalendarEvent } from '@bpartners/typescript-client';
import { createContext, FC, ReactNode, useContext, useMemo } from 'react';

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

  const store = useMemo(() => ({ currentCalendar, currentEvent, eventList, setCalendar, dialog: { getDialogStatus, setDialogStatus } }), []);

  return <CalendarContext.Provider value={store}>{children}</CalendarContext.Provider>;
};
