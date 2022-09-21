import { payingApi } from './api';
import { BpDataProviderType } from './bp-data-provider-type';

import authProvider from './auth-provider';
import { singleAccountGetter } from './account-provider';
import { v4 as uuid } from 'uuid';

const getUserInfo = async (): Promise<{ accountId: string; userId: string }> => {
  const userId = authProvider.getCachedWhoami().user.id;
  const accountId = (await singleAccountGetter(userId)).id;
  return { userId, accountId };
};

const productProvider: BpDataProviderType = {
  async getOne(userId: string) {
    throw new Error('Function not implemented.');
  },
  getList: async function (page: number, perPage: number, { categorized }: any): Promise<any[]> {
    const { accountId } = await getUserInfo();
    const { data } = await payingApi().getProducts(accountId, false);
    return data;
  },
  saveOrUpdate: async function (resources: any[]): Promise<any[]> {
    const { accountId } = await getUserInfo();
    return [await payingApi().createProducts(resources, accountId, uuid())];
  },
};

export default productProvider;
