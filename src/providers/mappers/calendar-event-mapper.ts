import { CalendarEvent } from 'bpartners-react-client';

export type TRaCalendarEvent = {
  id: string;
  title: string;
  start: string;
  end: string;
  metadata?: {
    location?: CalendarEvent['location'];
    organizer?: CalendarEvent['organizer'];
    participants?: CalendarEvent['participants'];
  };
};

export const calendarEventMapper = {
  toDomain({ from, id, location, organizer, participants, summary, to }: CalendarEvent): TRaCalendarEvent {
    return {
      id,
      title: summary,
      start: from.toISOString(),
      end: to.toISOString(),
      metadata: {
        location,
        organizer,
        participants,
      },
    };
  },
};
