import { payingApi } from './api';
import { BpDataProviderType } from './bp-data-provider-type';

import emptyToNull from 'src/common/utils/empty-to-null';
import { toMinors } from 'src/common/utils/money';
import { getUserInfo } from './utils';
import { ProductStatus } from 'bpartners-react-client';

export const importProducts = async (body: any) => {
  const { accountId } = await getUserInfo();
  return (await payingApi().importProducts(accountId, body)).data;
};

const productProvider: BpDataProviderType = {
  async getOne(userId: string) {
    throw new Error('Function not implemented.');
  },
  getList: async function (page: number, perPage: number, filters = { sort: {} }): Promise<any[]> {
    const {
      descriptionFilter,
      priceFilter,
      sort: { field, order },
    } = filters;
    const { accountId } = await getUserInfo();
    return (
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
  },
  saveOrUpdate: async function (resources: any[]): Promise<any[]> {
    const { accountId } = await getUserInfo();
    const toSend = resources.map(product => ({ ...emptyToNull(product) }));
    return [await payingApi().createProducts(accountId, toSend)];
  },
  update: async function (resources: any[]): Promise<any[]> {
    const { accountId } = await getUserInfo();
    return (await payingApi().crupdateProducts(accountId, resources)).data;
  },
  archive: async (resources: any[]) => {
    const { accountId } = await getUserInfo();
    return (await payingApi().updateProductsStatus(accountId, resources)).data;
  },
};

export default productProvider;
