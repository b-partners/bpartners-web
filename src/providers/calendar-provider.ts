import { BpDataProviderType, calendarApi, getCached } from '.';
import { calendarRedirectionUrls, getCalendarAuthRedirectionUrl } from 'src/constants/redirection-url';

export const calendarProvider: BpDataProviderType = {
  async getOne(calendarId: string) {
    const { userId } = getCached.userInfo();
    const { data: calendarEvent } = await calendarApi().getCalendarEvents(userId, calendarId);
    return calendarEvent;
  },
  async getList(page: number, perPage: number, filters: any) {
    const { to, from } = filters;
    const { userId } = getCached.userInfo();
    return (await calendarApi().usersUserIdCalendarsGet(userId)).data as any;
  },
  async saveOrUpdate(resources: any[], options = {}) {
    const { calendarId } = options;
    const { userId } = getCached.userInfo();
    return (await calendarApi().crupdateCalendarEvents(userId, calendarId, resources)).data;
  },
  async oauth2Init() {
    const { userId } = getCached.userInfo();
    return (await calendarApi().initConsent(userId, calendarRedirectionUrls)).data;
  },
  async oauth2ExchangeToken(code: string) {
    const { userId } = getCached.userInfo();
    return (await calendarApi().exchangeCode(userId, getCalendarAuthRedirectionUrl(code))).data;
  },
};
