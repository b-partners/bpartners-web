import { BpDataProviderType } from './bp-data-provider-type';
import { userAccountsApi } from './api';

const profileProvider: BpDataProviderType = {
  async getOne(id: string) {
    return userAccountsApi()
      .getUserById(id)
      .then(result => result.data);
  },
  getList: function (page: number, perPage: number, filter: any): Promise<any[]> {
    throw new Error('Function not implemented.');
  },
  saveOrUpdate: function (resources: any[]): Promise<any[]> {
    throw new Error('Function not implemented.');
  },
};

export default profileProvider;
