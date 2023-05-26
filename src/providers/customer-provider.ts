import { CustomerStatus } from 'bpartners-react-client';
import { BpDataProviderType, asyncGetUserInfo, customerApi, getCached, maxPageSize } from '.';

export const importCustomers = async (body: any) => {
  const { accountId } = getCached.userInfo();
  const { data } = await customerApi().importCustomers(accountId, body);
  return data;
};

export const customerProvider: BpDataProviderType = {
  getList: async function (page = 1, perPage = maxPageSize, filters = {}): Promise<any[]> {
    const { firstName, lastName, email, phoneNumber, city, country } = filters;
    const { accountId } = await asyncGetUserInfo();
    return (await customerApi().getCustomers(accountId, firstName, lastName, email, phoneNumber, city, country, CustomerStatus.ENABLED, page, perPage)).data;
  },
  getOne: function (customerId: string): Promise<any> {
    const { accountId } = getCached.userInfo();
    return customerApi().getCustomerById(accountId, customerId);
  },
  saveOrUpdate: async function (customers: any[]): Promise<any[]> {
    const { accountId } = getCached.userInfo();
    return (await customerApi().createCustomers(accountId, customers)).data;
  },
  update: async function (customers: any[]): Promise<any[]> {
    const { accountId } = getCached.userInfo();
    return (await customerApi().updateCustomers(accountId, customers)).data;
  },
  archive: async (resources: any[]) => {
    const { accountId } = getCached.userInfo();
    return (await customerApi().updateCustomerStatus(accountId, resources)).data;
  },
};
