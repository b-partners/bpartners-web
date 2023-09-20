import { CalendarEvent } from 'bpartners-react-client';
import { FC, createContext, useContext } from 'react';
import { TRaCalendarEvent } from 'src/providers/mappers';

const CalendarEventContext = createContext<TRaCalendarEvent>(null);
export const useCalendarEventContext = () => useContext(CalendarEventContext);

type CalendarEventProviderProps = {
  value: TRaCalendarEvent;
};

export const CalendarEventProvider: FC<CalendarEventProviderProps> = ({ value, children }) => {
  return <CalendarEventContext.Provider value={value}>{children}</CalendarEventContext.Provider>;
};
