import { prospectingApi } from './api';
import { BpDataProviderType } from './bp-data-provider-type';
import { getUserInfo } from './utils';

export const prospectingProvider: BpDataProviderType = {
  getList: async function (): Promise<any[]> {
    const { accountHId } = await getUserInfo();
    return (await prospectingApi().getProspects(accountHId)).data;
  },
  getOne: function (id: string): Promise<any> {
    throw new Error('Function not implemented.');
  },
  saveOrUpdate: async function (resources: any[]): Promise<any[]> {
    const { accountHId } = await getUserInfo();
    return (await prospectingApi().updateProspects(accountHId, resources)).data;
  },
};

export default prospectingProvider;
