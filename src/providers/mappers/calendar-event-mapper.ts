import { CalendarEvent } from '@bpartners/typescript-client';
import { CalendarProps } from '@react-admin/ra-calendar';
import { dateForInput, dateForInputWithoutTimezone } from '@/common/utils';
import { v4 as uuidV4 } from 'uuid';
export type TRaCalendarEvent = {
  id: string;
  title: string;
  start: string;
  end: string;
  location?: CalendarEvent['location'];
  organizer?: CalendarEvent['organizer'];
  participants?: CalendarEvent['participants'];
  isSynchronized?: boolean;
};

export const calendarEventMapper = {
  toDomain: ({ from, summary, to, id, ...others }: CalendarEvent) => ({
    id,
    title: summary,
    start: dateForInput(new Date(from)),
    end: dateForInput(new Date(to)),
    ...others,
  }),

  toRest({ title, start, end, ...others }: TRaCalendarEvent): CalendarEvent {
    return {
      summary: title,
      from: new Date(start),
      to: new Date(end),
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
    end: dateForInputWithoutTimezone(end),
    start: dateForInputWithoutTimezone(start),
    ...extendedProps,
  };
};
type DateRange = {
  end: Date;
  start: Date;
};
export const raCalendarEventCreationMapper = ({ end, start }: DateRange) => {
  return {
    end: dateForInputWithoutTimezone(end),
    start: dateForInputWithoutTimezone(start),
    title: 'Nouvelle évènement',
    id: uuidV4(),
  };
};
