import { singleAccountGetter } from './account-provider';
import { FileApi } from './api';
import authProvider from './auth-provider';
import { BpDataProviderType } from './bp-data-provider-type';
import { toArrayBuffer } from '../utils/to-array-buffer';
import customFileApi from './custom-file-api';

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

    return customFileApi()
      .uploadFile(binaryFile, accountId, 'logo.jpeg')
      .then(({ data }) => [data]);
  },
};
