import authProvider from './auth-provider';
import { BpDataProviderType } from './bp-data-provider-type';
import { payingApi } from './api';

const transactionProvider: BpDataProviderType = {
  async getOne(id: string) {
    throw new Error('Function not implemented.');
  },
  getList: async function (page: number, perPage: number, filter: any): Promise<any[]> {
    const { data } = await payingApi().getTransactions(authProvider.getCachedWhoami().id);
    return data;
  },
  saveOrUpdate: function (resources: any[]): Promise<any[]> {
    throw new Error('Function not implemented.');
  },
};

export default transactionProvider;
