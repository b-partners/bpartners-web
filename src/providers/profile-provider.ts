import { usersApi } from './api';
import { HaDataProviderType } from './ha-data-provider-type';

const profileProvider: HaDataProviderType = {
  async getOne(id: string) {
    const role = 'MANAGER';
    if (role === 'MANAGER') {
      return usersApi()
        .getManagerById(id)
        .then(result => result.data);
    }
  },
  getList: function (page: number, perPage: number, filter: any): Promise<any[]> {
    throw new Error('Function not implemented.');
  },
  saveOrUpdate: function (resources: any[]): Promise<any[]> {
    throw new Error('Function not implemented.');
  },
};

export default profileProvider;
