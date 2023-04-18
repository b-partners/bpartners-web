import { customerApi } from './api';
import authProvider from './auth-provider';
import { singleAccountGetter } from './account-provider';
import { BpDataProviderType } from './bp-data-provider-type';
import { maxPageSize } from './data-provider';
import { getUserInfo } from './invoice-provider';
import { CustomerStatus } from 'bpartners-react-client';

export const importCustomers = async (body: any) => {
  const userId = authProvider.getCachedWhoami().user.id;
  const accountId = (await singleAccountGetter(userId)).id;
  const { data } = await customerApi().importCustomers(accountId, body);
  return data;
};

export const customerProvider: BpDataProviderType = {
  getList: async function (page = 1, perPage = maxPageSize, filters = {}): Promise<any[]> {
    const { firstName, lastName, email, phoneNumber, city, country } = filters;
    const userId = authProvider.getCachedWhoami().user.id;
    const accountId = (await singleAccountGetter(userId)).id;
    const { data } = await customerApi().getCustomers(accountId, firstName, lastName, email, phoneNumber, city, country, CustomerStatus.ENABLED, page, perPage);
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
  archive: async (resources: any[]) => {
    const { accountId } = await getUserInfo();
    const { data } = await customerApi().updateCustomerStatus(accountId, resources);
    return data;
  },
};

export default customerProvider;
