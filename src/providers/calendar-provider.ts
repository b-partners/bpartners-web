import { calendarRedirectionUrls, getCalendarAuthRedirectionUrl } from '@/constants/redirection-url';
import { BpDataProviderType, calendarApi, getCached } from '.';

export const calendarProvider: BpDataProviderType = {
  async getList(_page: number, _perPage: number, _filters: any) {
    const { userId } = getCached.userInfo();
    return (await calendarApi().usersUserIdCalendarsGet(userId)).data as any;
  },
  async oauth2Init(calendarId: string) {
    const { userId } = getCached.userInfo();
    return (await calendarApi().initConsent(userId, calendarRedirectionUrls(calendarId))).data;
  },
  async oauth2ExchangeToken(code: string, calendarId: string) {
    const { userId } = getCached.userInfo();
    return (await calendarApi().exchangeCode(userId, getCalendarAuthRedirectionUrl(code, calendarId))).data;
  },
  getOne: function (_id?: string, _option?: any): Promise<any> {
    throw new Error('Function not implemented.');
  },
  saveOrUpdate: function (_resources: any[], _option?: any): Promise<any[]> {
    throw new Error('Function not implemented.');
  },
};
