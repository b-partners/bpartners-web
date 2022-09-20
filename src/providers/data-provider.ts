import { BpDataProviderType } from './bp-data-provider-type';
import { RaDataProviderType } from './ra-data-provider-type';
import profileProvider from './profile-provider';
import accountProvider, { customerProvider } from './account-provider';
import transactionProvider from './transaction-provider';

export const maxPageSize = 500;

const getProvider = (resourceType: string): BpDataProviderType => {
  if (resourceType === 'profile') return profileProvider;
  if (resourceType === 'account') return accountProvider;
  if (resourceType === 'transactions') return transactionProvider;
  if (resourceType === 'customers') return customerProvider;
  throw new Error('Unexpected resourceType: ' + resourceType);
};

const dataProvider: RaDataProviderType = {
  async getList(resourceType: string, params: any) {
    const pagination = params.pagination;
    const page = pagination.page === 0 ? 1 /* TODO(empty-pages) */ : pagination.page;
    let perPage = pagination.perPage;
    if (perPage > maxPageSize) {
      console.warn(`Page size is too big, truncating to maxPageSize=${maxPageSize}: resourceType=${resourceType}, requested pageSize=${perPage}`);
      perPage = maxPageSize;
    }

    const filter = params.filter;
    const result = await getProvider(resourceType).getList(page, perPage, filter);
    return { data: result, total: Number.MAX_SAFE_INTEGER };
  },
  async getOne(resourceType: string, params: any) {
    const result = await getProvider(resourceType).getOne(params.id);
    return { data: result };
  },
  async update(resourceType: string, params: any) {
    const result = await getProvider(resourceType).saveOrUpdate([params.data]);
    return { data: result[0] };
  },
  async create(resourceType: string, params: any) {
    const result = await getProvider(resourceType).saveOrUpdate([params.data]);
    return { data: result[0] };
  },
};

export default dataProvider;
