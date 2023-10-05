import { CalendarProvider } from 'bpartners-react-client';
import { BpDataProviderType, calendarApi, getCached } from '.';
import { calendarEventMapper } from './mappers';

export const calendarEventProvider: BpDataProviderType = {
  async getList(page: number, perPage: number, filters: any) {
    const { userId } = getCached.userInfo();
    const { calendarId, start_gte, start_lte } = filters;
    if (!calendarId || calendarId.length === 0) return [];
    const { data } = await calendarApi().getCalendarEvents(userId, calendarId, CalendarProvider.GOOGLE_CALENDAR, new Date(start_gte), new Date(start_lte));
    return data.map(calendarEventMapper.toDomain);
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
