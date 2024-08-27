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
};

const CalendarContext = createContext<RaCalendarContext>(null);
export const useCalendarContext = () => useContext(CalendarContext);

export const CalendarContextProvider: FC<RaCalendarContext> = ({ currentCalendar, currentEvent, eventList, children, setCalendar }) => {
  const contextValues = useMemo(() => ({ currentCalendar, currentEvent, eventList, setCalendar }), [currentCalendar, currentEvent, eventList, setCalendar]);
  return <CalendarContext.Provider value={contextValues}>{children}</CalendarContext.Provider>;
};
