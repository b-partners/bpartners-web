import { BpDataProviderType, getCached, maxPageSize, prospectingApi } from '.';

export const prospectingProvider: BpDataProviderType = {
  getList: async function (page = 1, perPage = maxPageSize, filters = {}): Promise<any[]> {
    const { searchName } = filters;
    const { accountHolderId } = getCached.userInfo();
    return (await prospectingApi().getProspects(accountHolderId, searchName)).data;
  },
  getOne: function (id: string): Promise<any> {
    throw new Error('Function not implemented.');
  },
  saveOrUpdate: async function (resources: any[]): Promise<any[]> {
    const { accountHolderId } = getCached.userInfo();
    return (await prospectingApi().updateProspects(accountHolderId, resources)).data;
  },
};
