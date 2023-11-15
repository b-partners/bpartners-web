export const redirectionUrl = {
  statusCode: 200,
  body: {
    redirectionStatusUrls: {
      successUrl: 'dummy',
      failureUrl: 'dummy',
    },
  },
};

export const calendars = [{ summary: 'holydays', id: 'holydays-calendar-id', permission: 'OWNER' }];

export const calendarEvents = [
  {
    summary: 'Event for today',
    organizer: 'Me',
    location: 'Antananarivo',
    from: new Date('2023-01-01T15:10'),
    id: 'today-event-id',
    to: new Date('2023-01-01T10:10'),
    participants: ['participant.1@gmail.com', 'participant.2@gmail.com'],
    updatedAt: new Date(),
  },
];
