import { prospectingApi } from './api';
import { BpDataProviderType } from './bp-data-provider-type';
import { getUserInfo } from './utils';

export const marketplaceProvider: BpDataProviderType = {
  getList: async function (page: number, perPage: number, filter: any): Promise<any[]> {
    const { accountId } = await getUserInfo();
    return (await prospectingApi().getMarketplaces(accountId, page, perPage)).data;
  },
  getOne: function (id: string): Promise<any> {
    throw new Error('Function not implemented.');
  },
  saveOrUpdate: async function (customers: any[]): Promise<any[]> {
    throw new Error('Function not implemented.');
  },
};

export default marketplaceProvider;
