import { ImportProspect } from '@bpartners/typescript-client';
import { BpDataProviderType, getCached, maxPageSize, prospectingApi } from '.';

export const prospectingProvider: BpDataProviderType = {
  getList: async function (_page = 1, _perPage = maxPageSize, filters = {}): Promise<any[]> {
    const { searchName, status } = filters;
    const { accountHolderId } = getCached.userInfo();
    return (await prospectingApi().getProspects(accountHolderId, searchName, undefined, status, _page, _perPage)).data;
  },
  getOne: function (_id: string): Promise<any> {
    throw new Error('Function not implemented.');
  },
  saveOrUpdate: async function (resources: any[]): Promise<any[]> {
    const { accountHolderId } = getCached.userInfo();
    return (await prospectingApi().updateProspects(accountHolderId, resources)).data;
  },
  update: async ([resource]) => {
    const { id } = resource;
    const { accountHolderId } = getCached.userInfo();

    const { data } = await prospectingApi().updateProspectsStatus(accountHolderId, id, resource);
    return [data];
  },
};

export const importProspects = async (resources: ImportProspect) => {
  const { accountHolderId } = getCached.userInfo();
  return (await prospectingApi().importProspects(accountHolderId, resources)).data;
};
