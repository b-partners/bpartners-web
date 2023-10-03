import { BpDataProviderType, calendarApi, getCached } from '.';
import { calendarEventMapper } from './mappers';
import { mapEvents } from './utils';

export const calendarEventProvider: BpDataProviderType = {
  async getList(page: number, perPage: number, filters: any) {
    const { userId } = getCached.userInfo();
    const { calendarId, start_gte, start_lte, calendarProvider } = filters;
    if (!calendarId || calendarId.length === 0) return [];
    const isCalendarSync = getCached.calendarSync();

    if (!isCalendarSync) {
      const { data: calendarEvents } = await calendarApi().getCalendarEvents(userId, calendarId, calendarProvider, new Date(start_gte), new Date(start_lte));
      return calendarEvents.map(calendarEvent => calendarEventMapper.toDomain(calendarEvent));
    } else {
      const [local, google] = await Promise.all([
        (await calendarApi().getCalendarEvents(userId, calendarId, 'LOCAL', new Date(start_gte), new Date(start_lte))).data,
        (await calendarApi().getCalendarEvents(userId, calendarId, 'GOOGLE_CALENDAR', new Date(start_gte), new Date(start_lte))).data,
      ]);
      const res = mapEvents(local, google);

      console.log(res);

      return res;
    }
  },
  async saveOrUpdate(resources: any[], options = {}) {
    const { calendarId } = options;
    const { userId } = getCached.userInfo();
    return (await calendarApi().crupdateCalendarEvents(userId, calendarId || '', resources.map(calendarEventMapper.toRest))).data;
  },
  getOne: function (id?: string, option?: any): Promise<any> {
    throw new Error('Function not implemented.');
  },
};
