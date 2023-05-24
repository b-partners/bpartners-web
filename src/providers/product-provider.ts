import { BpDataProviderType, asyncGetUserInfo, getCached, payingApi } from '.';

import { ProductStatus } from 'bpartners-react-client';
import { emptyToNull, toMinors } from 'src/common/utils';
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
    const data = (
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

    if (filters.mapped) {
      return data.map(productMapper.toDomain);
    }
    return data;
  },
  saveOrUpdate: async function (resources: any[]): Promise<any[]> {
    const { accountId } = getCached.userInfo();
    const toSend = resources.map(product => ({ ...emptyToNull(product) }));
    return (await payingApi().createProducts(accountId, toSend)).data.map(productMapper.toDomain);
  },
  update: async function (resources: any[]): Promise<any[]> {
    const { accountId } = getCached.userInfo();
    return (await payingApi().crupdateProducts(accountId, resources)).data.map(productMapper.toDomain);
  },
  archive: async (resources: any[]) => {
    const { accountId } = getCached.userInfo();
    return (await payingApi().updateProductsStatus(accountId, resources)).data;
  },
};
