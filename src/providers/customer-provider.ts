import { customerApi } from './api';
import authProvider from './auth-provider';
import { singleAccountGetter } from './account-provider';
import { BpDataProviderType } from './bp-data-provider-type';

export const customerProvider: BpDataProviderType = {
  getList: async function (page: number, perPage: number, filter: any): Promise<any[]> {
    const userId = authProvider.getCachedWhoami().user.id;
    const accountId = (await singleAccountGetter(userId)).id;
    const { data } = await customerApi().getCustomers(accountId);
    return data;
  },
  getOne: function (id: string): Promise<any> {
    throw new Error('Function not implemented.');
  },
  saveOrUpdate: function (resources: any[]): Promise<any[]> {
    throw new Error('Function not implemented.');
  },
};

export default customerProvider;
