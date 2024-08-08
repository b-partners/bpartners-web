import { setHours } from 'date-fns';
import { v4 as uuIdV4 } from 'uuid';

export const redirectionUrl = {
  statusCode: 200,
  body: {
    redirectionStatusUrls: {
      successUrl: 'dummy',
      failureUrl: 'dummy',
    },
  },
};

export const calendarGenerator = () => {
  const id = uuIdV4();
  return {
    summary: 'holydays',
    id,
    permission: 'OWNER',
  };
};

export const calendarEventsGenerator = () => {
  const id = uuIdV4();
  return [
    {
      summary: 'Event for today',
      organizer: 'Me',
      location: 'Antananarivo',
      from: setHours(new Date(), 10),
      id,
      to: setHours(new Date(), 12),
      participants: ['participant.1@gmail.com', 'participant.2@gmail.com'],
      updatedAt: new Date(),
    },
  ];
};

export const calendars = [{ summary: 'holydays', id: 'holydays-calendar-id', permission: 'OWNER' }];

export const calendarEvents = [
  {
    summary: 'Event for today',
    organizer: 'Me',
    location: 'Antananarivo',
    from: new Date(),
    id: 'today-event-id',
    to: new Date('2023-01-01T10:10'),
    participants: ['participant.1@gmail.com', 'participant.2@gmail.com'],
    updatedAt: new Date(),
  },
];
