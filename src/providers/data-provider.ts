import { UpdateParams } from 'react-admin';
import {
  accountHolderProvider,
  accountProvider,
  BpDataProviderType,
  customerProvider,
  marketplaceProvider,
  productProvider,
  profileProvider,
  prospectingProvider,
  RaDataProviderType,
  transactionProvider,
} from '.';
import { invoiceProvider } from './invoice-provider';

export const maxPageSize = 10_000;

const getProvider = (resourceType: string): BpDataProviderType => {
  if (resourceType === 'profile') return profileProvider;
  if (resourceType === 'account') return accountProvider;
  if (resourceType === 'transactions') return transactionProvider;
  if (resourceType === 'products') return productProvider;
  if (resourceType === 'customers') return customerProvider;
  if (resourceType === 'marketplaces') return marketplaceProvider;
  if (resourceType === 'prospects') return prospectingProvider;
  if (resourceType === 'invoices') return invoiceProvider;
  if (resourceType === 'accountHolder') return accountHolderProvider;
  throw new Error('Unexpected resourceType: ' + resourceType);
};

export const dataProvider: RaDataProviderType = {
  async getList(resourceType: string, params: any) {
    const pagination = params.pagination;
    const page = pagination.page === 0 ? 1 /* TODO(empty-pages) */ : pagination.page;

    let perPage = pagination.perPage;
    if (perPage > maxPageSize) {
      console.warn(`Page size is too big, truncating to maxPageSize=${maxPageSize}: resourceType=${resourceType}, requested pageSize=${perPage}`);
      perPage = maxPageSize;
    }

    const filter = params.filter;
    const result = await getProvider(resourceType).getList(page, perPage, { ...filter, sort: params.sort || {} });
    return { data: result, total: Number.MAX_SAFE_INTEGER };
  },
  async getOne(resourceType: string, params: any) {
    const result = await getProvider(resourceType).getOne(params.id);
    return { data: result };
  },
  async update(resourceType: string, params: UpdateParams) {
    let result;
    if (getProvider(resourceType).update) {
      result = await getProvider(resourceType).update([{ ...params.data, id: params.id }]);
    } else {
      result = await getProvider(resourceType).saveOrUpdate([params.data]);
    }
    return { data: result[0] };
  },
  async create(resourceType: string, params: any) {
    const result = await getProvider(resourceType).saveOrUpdate([params.data]);
    return { data: result[0] };
  },
  async archive(resourceType, params) {
    const result = await getProvider(resourceType).archive(params.data);
    return { data: result };
  },
};
