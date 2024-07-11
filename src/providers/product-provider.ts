import { asyncGetUserInfo, BpDataProviderType, getCached, payingApi } from '.';

import { ProductStatus } from '@bpartners/typescript-client';
import { toMinors } from '@/common/utils';
import { productMapper } from './mappers';

export const importProducts = async (body: any) => {
  const { accountId } = getCached.userInfo();
  return (await payingApi().importProducts(accountId, body)).data;
};
export const exportProducts = async () => {
  const { accountId } = getCached.userInfo();
  return (await payingApi().exportProducts(accountId, 'text/csv')).data;
};

export const productProvider: BpDataProviderType = {
  async getOne(productId: string) {
    const { accountId } = getCached.userInfo();
    const { data: product } = await payingApi().getProductById(accountId, productId);
    return productMapper.toDomain(product);
  },
  getList: async function (page: number, perPage: number, filters = { sort: {} }): Promise<any[]> {
    const {
      descriptionFilter,
      priceFilter,
      sort: { field, order },
    } = filters;
    const { accountId } = await asyncGetUserInfo();
    const data = (
      await payingApi().getProducts(
        accountId,
        true,
        field === 'description' ? order : undefined,
        field === 'unitPrice' ? order : undefined,
        field === 'createdAt' ? order : undefined,
        descriptionFilter,
        priceFilter ? toMinors(+priceFilter) : undefined,
        //TODO: use status from filter instead of static product status
        ProductStatus.ENABLED,
        page,
        perPage
      )
    ).data;

    if (filters.mapped) {
      return data.map(productMapper.toDomain);
    }
    return data;
  },
  saveOrUpdate: async function (resources: any[]): Promise<any[]> {
    const { accountId } = getCached.userInfo();
    const toSend = resources.map(productMapper.toRest);
    return (await payingApi().createProducts(accountId, toSend)).data.map(productMapper.toDomain);
  },
  update: async function (resources: any[]): Promise<any[]> {
    const { accountId } = getCached.userInfo();
    const toSend = resources.map(productMapper.toRest);
    return (await payingApi().crupdateProducts(accountId, toSend)).data.map(productMapper.toDomain);
  },
  archive: async (resources: any[]) => {
    const { accountId } = getCached.userInfo();
    return (await payingApi().updateProductsStatus(accountId, resources)).data;
  },
};
