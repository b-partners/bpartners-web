import { CalendarProps } from '@react-admin/ra-calendar';
import { CalendarEvent } from 'bpartners-react-client';
import { zonedTimeToUtc } from 'date-fns-tz';
import { dateForInput } from 'src/common/utils';
import { v4 as uuidV4 } from 'uuid';
import { getCached } from '../cache';

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
    const timeZone = getCached.timeZone();
    return {
      summary: title,
      from: zonedTimeToUtc(start, timeZone),
      to: zonedTimeToUtc(end, timeZone),
      ...others,
    };
  },
};

export const raCalendarEventMapper = (value: Parameters<CalendarProps['eventClick']>[0]): TRaCalendarEvent => {
  const { publicId: id, title, extendedProps } = value.event._def;
  const { end, start } = value.event._instance.range;
  return {
    id,
    title,
    end: dateForInput(end),
    start: dateForInput(start),
    ...extendedProps,
  };
};

type DateRange = { end: Date; start: Date };

export const raCalendarEventCreationMapper = ({ end, start }: DateRange) => ({
  end: dateForInput(end),
  start: dateForInput(start),
  title: 'Nouvelle évènement',
  id: uuidV4(),
});
