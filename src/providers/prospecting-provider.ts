import { ImportProspect } from '@bpartners/typescript-client';
import { BpDataProviderType, getCached, maxPageSize, prospectingApi } from '.';

export const prospectingProvider: BpDataProviderType = {
  getList: async function (page = 1, perPage = maxPageSize, filters = {}) {
    const { searchName, status } = filters;
    const { accountHolderId } = getCached.userInfo();
    return (await prospectingApi().getProspects(accountHolderId, searchName, undefined, status, page, perPage)).data;
  },
  getOne: async function (id: string) {
    const { accountHolderId } = getCached.userInfo();
    return prospectingApi()
      .getProspectById(accountHolderId, id)
      .then(response => response.data);
  },
  saveOrUpdate: async function (resources: any[]) {
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
