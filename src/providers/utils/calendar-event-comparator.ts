import { equals } from '@gthrm/deep-diff';
import { CalendarEvent } from 'bpartners-react-client';
import { calendarEventMapper } from '../mappers';

export const mapEvents = (local: CalendarEvent[] = [], _google: CalendarEvent[] = []) => {
  const fusionOfEvents: CalendarEvent[] & { google?: CalendarEvent[] } = [];
  const google = _google.slice();
  local.forEach(localEvent => {
    const fromGoogleIndex = google.findIndex(e => e.id === localEvent.id);
    if (
      fromGoogleIndex === -1 ||
      equals({ ...localEvent, updatedAt: undefined, isSynchronized: false }, { ...google[fromGoogleIndex], updatedAt: undefined, isSynchronized: false })
    ) {
      fusionOfEvents.push(calendarEventMapper.toDomain({ ...localEvent, isSynchronized: true }));
    } else {
      fusionOfEvents.push(calendarEventMapper.toDomain({ ...localEvent, isSynchronized: false }, google[fromGoogleIndex]));
    }
    if (fromGoogleIndex !== -1) {
      google.splice(fromGoogleIndex, 1);
    }
  });

  return fusionOfEvents;
};
