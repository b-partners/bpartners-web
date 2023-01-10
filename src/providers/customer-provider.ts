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
  saveOrUpdate: async function (customers: any[]): Promise<any[]> {
    const userId = authProvider.getCachedWhoami().user.id;
    const accountId = (await singleAccountGetter(userId)).id;
    const { data } = await customerApi().createCustomers(accountId, customers);
    return data;
  },
  update: async function (customers: any[]): Promise<any[]> {
    const userId = authProvider.getCachedWhoami().user.id;
    const accountId = (await singleAccountGetter(userId)).id;
    const { data } = await customerApi().updateCustomers(accountId, customers);
    return data;
  },
};

export default customerProvider;
