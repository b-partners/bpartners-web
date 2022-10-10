import { singleAccountGetter } from './account-provider';
import { FileApi } from './api';
import authProvider from './auth-provider';
import { BpDataProviderType } from './bp-data-provider-type';
import { getMimeType } from '../utils/get-mime-type';
import { toArrayBuffer } from '../utils/to-array-buffer';

export const fileProvider: BpDataProviderType = {
  async getOne(id: string) {
    const userId = authProvider.getCachedWhoami().user.id;
    const accountId = (await singleAccountGetter(userId)).id;
    return FileApi()
      .getFileById(accountId, id)
      .then(({ data }) => data);
  },
  getList: function (page: number, perPage: number, filter: any): Promise<any[]> {
    throw new Error('Function not implemented.');
  },
  async saveOrUpdate(resources: any): Promise<any[]> {
    const userId = authProvider.getCachedWhoami().user.id;
    const accountId = (await singleAccountGetter(userId)).id;
    const binaryFile = await toArrayBuffer(resources);
    const type = getMimeType(resources);

    return FileApi()
      .uploadFile(binaryFile, accountId, `logo.jpeg`, { headers: { 'Content-Type': type } })
      .then(data => [data]);
  },
};
