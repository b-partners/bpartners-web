import { getPagination } from '@/common/utils/pagination-utilities';
import { CreateParams, UpdateParams } from 'react-admin';
import {
  accountHolderProvider,
  accountProvider,
  BpDataProviderType,
  customerProvider,
  fileProvider,
  geocodeProvider,
  productProvider,
  profileProvider,
  prospectingProvider,
  RaDataProviderType,
  relaunchProvider,
  saveUserAnnotationProvider,
} from '.';
import { areaPictureDetailsProvider } from './area-picture-provider';
import { draftAreaPictureAnnotatorProvider } from './draft-area-annotations-provider';
import { invoiceProvider } from './invoice-provider';

export const maxPageSize = 10_000;

const getProvider = (resourceType: string): BpDataProviderType => {
  if (resourceType === 'profile') return profileProvider;
  if (resourceType === 'account') return accountProvider;
  if (resourceType === 'products') return productProvider;
  if (resourceType === 'customers') return customerProvider;
  if (resourceType === 'prospects') return prospectingProvider;
  if (resourceType === 'invoices') return invoiceProvider;
  if (resourceType === 'accountHolder') return accountHolderProvider;
  if (resourceType === 'invoiceRelaunch') return relaunchProvider as any;
  if (resourceType === 'drafts-annotations') return draftAreaPictureAnnotatorProvider;
  if (resourceType === 'area-picture-details') return areaPictureDetailsProvider;
  if (resourceType === 'files') return fileProvider;
  if (resourceType === 'geocode') return geocodeProvider;
  if (resourceType === 'save-user-annotation') return saveUserAnnotationProvider;
  throw new Error('Unexpected resourceType: ' + resourceType);
};

export const dataProvider: RaDataProviderType = {
  async getList(resourceType: string, params: any) {
    const pagination = params.pagination;
    const page = pagination.page === 0 ? 1 : pagination.page;

    let perPage = pagination.perPage;
    if (perPage > maxPageSize) {
      console.warn(`Page size is too big, truncating to maxPageSize=${maxPageSize}: resourceType=${resourceType}, requested pageSize=${perPage}`);
      perPage = maxPageSize;
    }

    const filter = params.filter;

    const { data, pageInfo } = await getPagination({
      filters: filter,
      page,
      perPage,
      resource: resourceType,
      fetcher: p => getProvider(resourceType).getList(p, perPage, { ...filter, sort: params.sort || {} }),
    });

    return { data, pageInfo, total: data.length === 0 ? 0 : Number.MAX_SAFE_INTEGER };
  },
  async getOne(resourceType: string, params: any) {
    const result = await getProvider(resourceType).getOne(params.id, params.meta);
    return { data: result };
  },
  async update(resourceType: string, params: UpdateParams) {
    let result;
    if (getProvider(resourceType).update) {
      result = await getProvider(resourceType).update([{ ...params.data, id: params.id }]);
    } else {
      result = await getProvider(resourceType).saveOrUpdate([params.data], params);
    }
    return { data: result[0] };
  },
  async create(resourceType: string, params: CreateParams) {
    const result = await getProvider(resourceType).saveOrUpdate([params.data], params.meta);
    return { data: result[0] };
  },
  async archive(resourceType, params) {
    const result = await getProvider(resourceType).archive(params.data);
    return { data: result };
  },
  async oauth2Init(resourceType, params) {
    const data = await getProvider(resourceType).oauth2Init(params);
    return { data };
  },
  async oauth2ExchangeToken(resourceType, params) {
    const { code, options } = params;
    const data = await getProvider(resourceType).oauth2ExchangeToken(code, options);
    return { data };
  },
};
