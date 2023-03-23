import { payingApi } from './api';
import { BpDataProviderType } from './bp-data-provider-type';

import authProvider from './auth-provider';
import { singleAccountGetter } from './account-provider';
import emptyToNull from 'src/common/utils/empty-to-null';
import { toMinors } from 'src/common/utils/money';

const getUserInfo = async (): Promise<{ accountId: string; userId: string }> => {
  const userId = authProvider.getCachedWhoami().user.id;
  const accountId = (await singleAccountGetter(userId)).id;
  return { userId, accountId };
};

export const importProducts = async (body: any) => {
  const userId = authProvider.getCachedWhoami().user.id;
  const accountId = (await singleAccountGetter(userId)).id;
  const { data } = await payingApi().importProducts(accountId, body);
  return data;
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
    const { data } = await payingApi().getProducts(
      accountId,
      true,
      field === 'description' ? order : undefined,
      field === 'unitPrice' ? order : undefined,
      undefined,
      descriptionFilter,
      priceFilter ? toMinors(+priceFilter) : undefined,
      page,
      perPage
    );
    return data;
  },
  saveOrUpdate: async function (resources: any[]): Promise<any[]> {
    const { accountId } = await getUserInfo();
    const toSend = resources.map(product => ({ ...emptyToNull(product) }));
    return [await payingApi().createProducts(accountId, toSend)];
  },
  update: async function (resources: any[]): Promise<any[]> {
    const userId = authProvider.getCachedWhoami().user.id;
    const accountId = (await singleAccountGetter(userId)).id;
    const { data } = await payingApi().crupdateProducts(accountId, resources);
    return data;
  },
};

export const archiveInvoice = async (resources: any[]) => {
  const { accountId } = await getUserInfo();
  return await payingApi().updateProductsStatus(accountId, resources);
};

export default productProvider;
