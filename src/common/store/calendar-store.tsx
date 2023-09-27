import { Calendar, CalendarEvent } from 'bpartners-react-client';
import { FC, createContext, useContext } from 'react';
import { TRaCalendarEvent } from 'src/providers/mappers';

type RaCalendarContext = {
  currentEvent: TRaCalendarEvent;
  currentCalendar: Calendar;
  eventList: CalendarEvent[];
};

const CalendarContext = createContext<RaCalendarContext>(null);
export const useCalendarContext = () => useContext(CalendarContext);

export const CalendarContextProvider: FC<RaCalendarContext> = ({ currentCalendar, currentEvent, eventList, children }) => {
  return <CalendarContext.Provider value={{ currentCalendar, currentEvent, eventList }}>{children}</CalendarContext.Provider>;
};
