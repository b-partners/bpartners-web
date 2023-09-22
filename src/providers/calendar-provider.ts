import { BpDataProviderType, calendarApi, getCached } from '.';
import { calendarRedirectionUrls, getCalendarAuthRedirectionUrl } from 'src/constants/redirection-url';

export const calendarProvider: BpDataProviderType = {
  async getList(page: number, perPage: number, filters: any) {
    const { userId } = getCached.userInfo();
    return (await calendarApi().usersUserIdCalendarsGet(userId)).data as any;
  },
  async oauth2Init() {
    const { userId } = getCached.userInfo();
    return (await calendarApi().initConsent(userId, calendarRedirectionUrls)).data;
  },
  async oauth2ExchangeToken(code: string) {
    const { userId } = getCached.userInfo();
    return (await calendarApi().exchangeCode(userId, getCalendarAuthRedirectionUrl(code))).data;
  },
  getOne: function (id?: string, option?: any): Promise<any> {
    throw new Error('Function not implemented.');
  },
  saveOrUpdate: function (resources: any[], option?: any): Promise<any[]> {
    throw new Error('Function not implemented.');
  },
};
