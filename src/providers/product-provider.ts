import { BpDataProviderType, asyncGetUserInfo, getCached, payingApi } from '.';

import { ProductStatus } from 'bpartners-react-client';
import { toMinors } from 'src/common/utils/money';
import { productMapper } from './mappers';

export const importProducts = async (body: any) => {
  const { accountId } = getCached.userInfo();
  return (await payingApi().importProducts(accountId, body)).data;
};

export const productProvider: BpDataProviderType = {
  async getOne(userId: string) {
    throw new Error('Function not implemented.');
  },
  getList: async function (page: number, perPage: number, filters = { sort: {} }): Promise<any[]> {
    const {
      descriptionFilter,
      priceFilter,
      sort: { field, order },
    } = filters;
    const { accountId } = await asyncGetUserInfo();
    const products = (
      await payingApi().getProducts(
        accountId,
        true,
        field === 'description' ? order : undefined,
        field === 'unitPrice' ? order : undefined,
        undefined,
        descriptionFilter,
        priceFilter ? toMinors(+priceFilter) : undefined,
        //TODO: use status from filter instead of static product status
        ProductStatus.ENABLED,
        page,
        perPage
      )
    ).data;

    return products.map(productMapper.toDomain);
  },
  saveOrUpdate: async function (resources: any[]): Promise<any[]> {
    const { accountId } = getCached.userInfo();
    const toSend = resources.map(productMapper.toRest);

    const products = (await payingApi().createProducts(accountId, toSend)).data;
    return products.map(productMapper.toDomain);
  },
  update: async function (resources: any[]): Promise<any[]> {
    const { accountId } = getCached.userInfo();
    const toSend = resources.map(productMapper.toRest);
    const products = (await payingApi().crupdateProducts(accountId, toSend)).data;
    return products.map(productMapper.toDomain);
  },
  archive: async (resources: any[]) => {
    const { accountId } = getCached.userInfo();
    return (await payingApi().updateProductsStatus(accountId, resources)).data;
  },
};
