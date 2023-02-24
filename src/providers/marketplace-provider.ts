import { singleAccountGetter } from './account-provider';
import { prospectingApi } from './api';
import authProvider from './auth-provider';
import { BpDataProviderType } from './bp-data-provider-type';

export const marketplaceProvider: BpDataProviderType = {
  getList: async function (page: number, perPage: number, filter: any): Promise<any[]> {
    const userId = authProvider.getCachedWhoami().user.id;
    const accountId = (await singleAccountGetter(userId)).id;
    const { data } = await prospectingApi().getMarketplaces(accountId, page, perPage);
    return data;
  },
  getOne: function (id: string): Promise<any> {
    throw new Error('Function not implemented.');
  },
  saveOrUpdate: async function (customers: any[]): Promise<any[]> {
    throw new Error('Function not implemented.');
  },
};

export default marketplaceProvider;
