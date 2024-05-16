import { Customer, CustomerStatus } from '@bpartners/typescript-client';
import { BpDataProviderType, asyncGetUserInfo, customerApi, getCached, maxPageSize } from '.';

export const importCustomers = async (body: any) => {
  const { accountId } = getCached.userInfo();
  const { data } = await customerApi().importCustomers(accountId, body);
  return data;
};
export const exportCustomers = async () => {
  const { accountId } = getCached.userInfo();
  return (await customerApi().exportCustomers(accountId, 'text/csv')).data;
};

const rmRaProps = (dirtyCustomer: any): Customer => {
  if (dirtyCustomer.config) {
    const { config, headers, request, data, status, statusText, ...customer } = dirtyCustomer;
    return { ...customer, status: data.status };
  }
  return dirtyCustomer;
};

export const customerProvider: BpDataProviderType = {
  getList: async function (page = 1, perPage = maxPageSize, filters = {}): Promise<any[]> {
    const { customerListSearch } = filters;
    const searchValues = ((customerListSearch as string) || '').split(' ');
    const { accountId } = await asyncGetUserInfo();
    const { data } = await customerApi().getCustomers(
      accountId,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      CustomerStatus.ENABLED,
      searchValues,
      undefined,
      page,
      perPage
    );
    return data;
  },
  getOne: async function (customerId: string): Promise<any> {
    const { accountId } = getCached.userInfo();
    return (await customerApi().getCustomerById(accountId, customerId)).data;
  },
  saveOrUpdate: async function ([resource]: any[]): Promise<any[]> {
    const { accountId } = getCached.userInfo();
    return (await customerApi().createCustomers(accountId, [rmRaProps(resource)])).data;
  },
  update: async function ([resource]: any[]): Promise<any[]> {
    const { accountId } = getCached.userInfo();
    return (await customerApi().updateCustomers(accountId, [rmRaProps(resource)])).data;
  },
  archive: async (resources: any[]) => {
    const { accountId } = getCached.userInfo();
    return (await customerApi().updateCustomerStatus(accountId, resources)).data;
  },
};
