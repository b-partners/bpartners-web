import { BpDataProviderType, getCached, prospectingApi } from '.';

export const prospectingProvider: BpDataProviderType = {
  getList: async function (): Promise<any[]> {
    const { accountHolderId } = getCached.userInfo();
    return (await prospectingApi().getProspects(accountHolderId)).data;
  },
  getOne: function (id: string): Promise<any> {
    throw new Error('Function not implemented.');
  },
  saveOrUpdate: async function (resources: any[]): Promise<any[]> {
    const { accountHolderId } = getCached.userInfo();
    return (await prospectingApi().updateProspects(accountHolderId, resources)).data;
  },
};
