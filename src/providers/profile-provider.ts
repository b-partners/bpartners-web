import { BpDataProviderType } from './bp-data-provider-type';
import { securityApi } from './api';

const profileProvider: BpDataProviderType = {
  async getOne(id: string) {
    return securityApi()
      .whoami() //TODO: change when backend is not broken anymore
      .then(result => result.data.user);
  },
  getList: function (page: number, perPage: number, filter: any): Promise<any[]> {
    throw new Error('Function not implemented.');
  },
  saveOrUpdate: function (resources: any[]): Promise<any[]> {
    throw new Error('Function not implemented.');
  },
};

export default profileProvider;
