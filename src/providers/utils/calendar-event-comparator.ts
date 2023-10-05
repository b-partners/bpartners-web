import { equals } from '@gthrm/deep-diff';
import { CalendarEvent } from 'bpartners-react-client';
import { TRaCalendarEvent, calendarEventMapper } from '../mappers';

export interface TNotSyncCalendarEvent extends TRaCalendarEvent {
  google?: TRaCalendarEvent;
}

export const mapEvents = (local: CalendarEvent[] = [], _google: CalendarEvent[] = []) => {
  const fusionOfEvents: TNotSyncCalendarEvent[] = [];
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
