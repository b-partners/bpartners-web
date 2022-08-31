import authProvider from './auth-provider';
import { BpDataProviderType } from './bp-data-provider-type';
import { payingApi } from './api';

const profileProvider: BpDataProviderType = {
  async getOne(id: string) {
    throw new Error('Function not implemented.');
  },
  getList: function (page: number, perPage: number, filter: any): Promise<any[]> {
    return payingApi().getTransactions(authProvider.getCachedWhoami().id);
  },
  saveOrUpdate: function (resources: any[]): Promise<any[]> {
    throw new Error('Function not implemented.');
  },
};

export default profileProvider;
