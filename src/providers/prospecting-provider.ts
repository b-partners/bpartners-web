import { getCachedAccountHolder, singleAccountGetter } from './account-provider';
import { prospectingApi } from './api';
import authProvider from './auth-provider';
import { BpDataProviderType } from './bp-data-provider-type';

export const prospectingProvider: BpDataProviderType = {
  getList: async function (): Promise<any[]> {
    const userId = authProvider.getCachedWhoami().user.id;
    const ahId = getCachedAccountHolder().id;
    const { data } = await prospectingApi().getProspects(ahId);
    return data;
  },
  getOne: function (id: string): Promise<any> {
    throw new Error('Function not implemented.');
  },
  saveOrUpdate: function (resources: any[]): Promise<any[]> {
    throw new Error('Function not implemented.');
  },
};

export default prospectingProvider;
