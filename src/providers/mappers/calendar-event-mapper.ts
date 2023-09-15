import { CalendarEvent } from 'bpartners-react-client';

export type TRaCalendarEvent = {
  id: string;
  title: string;
  start: string;
  end: string;
  location?: CalendarEvent['location'];
  organizer?: CalendarEvent['organizer'];
  participants?: CalendarEvent['participants'];
};

export const calendarEventMapper = {
  toDomain({ from, summary, to, id, ...others }: CalendarEvent): TRaCalendarEvent {
    return {
      id,
      title: summary,
      start: from as any,
      end: to as any,
      ...others,
    };
  },
  toRest({ title, start, end, ...others }: TRaCalendarEvent): CalendarEvent {
    return {
      summary: title,
      from: new Date(start),
      to: new Date(end),
      ...others,
    };
  },
};
