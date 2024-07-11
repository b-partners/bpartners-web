import sheetRedirectionUrls from '@/security/googleSheetConsent/sheet-redirection-urls';
import { BpDataProviderType, sheetApi } from '.';
import { getCached } from './cache';

export const sheetProvider: BpDataProviderType = {
  async getList(page: number, perPage: number, filters: any) {
    throw new Error('Function not implemented.');
  },
  async oauth2Init() {
    const { userId } = getCached.userInfo();
    const redirectionStatusUrls = { redirectionStatusUrls: sheetRedirectionUrls };
    return (await sheetApi().initSheetConsent(userId, redirectionStatusUrls)).data;
  },
  async oauth2ExchangeToken(code: string) {
    const { userId } = getCached.userInfo();
    const values = { code: code, redirectUrls: sheetRedirectionUrls };
    return (await sheetApi().exchangeSheetCode(userId, values)).data;
  },
  getOne: function (id?: string, option?: any): Promise<any> {
    throw new Error('Function not implemented.');
  },
  saveOrUpdate: function (resources: any[], option?: any): Promise<any[]> {
    throw new Error('Function not implemented.');
  },
};
