import { CalendarAuth, CalendarConsentInit, Redirection1 } from 'bpartners-react-client';
import { BpDataProviderType, calendarApi, getCached } from '.';

const getCalendarAuth = (code: string): CalendarAuth => ({
  code,
  redirectUrls: {
    failureUrl: 'https://dashboard-preprod.bpartners.app/calendar-sync/failed',
    successUrl: 'https://dashboard-preprod.bpartners.app/calendar-sync',
  },
});

const redirectionUrls: CalendarConsentInit = {
  redirectionStatusUrls: {
    failureUrl: 'https://dashboard-preprod.bpartners.app/calendar-sync/failed',
    successUrl: 'https://dashboard-preprod.bpartners.app/calendar-sync',
  },
};

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
    return (await calendarApi().initConsent(userId, redirectionUrls)).data;
  },
  async oauth2ExchangeToken(code: string) {
    const { userId } = getCached.userInfo();
    return (await calendarApi().exchangeCode(userId, getCalendarAuth(code))).data;
  },
};
