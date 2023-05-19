import { BpDataProviderType, cache, userAccountsApi } from '.';

export const profileProvider: BpDataProviderType = {
  async getOne(id: string) {
    const { data: user } = await userAccountsApi().getUserById(id);
    return cache.user(user);
  },
  getList: function (page: number, perPage: number, filter: any): Promise<any[]> {
    throw new Error('Function not implemented.');
  },
  saveOrUpdate: function (resources: any[]): Promise<any[]> {
    throw new Error('Function not implemented.');
  },
};
