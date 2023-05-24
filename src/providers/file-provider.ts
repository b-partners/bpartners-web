import { FileApi, getCached } from '.';
import { getMimeType, toArrayBuffer } from '../common/utils';
import { BpDataProviderType } from './bp-data-provider-type';

export const fileProvider: BpDataProviderType = {
  async getOne(id: string) {
    const { accountId } = getCached.userInfo();
    return FileApi()
      .getFileById(accountId, id)
      .then(({ data }) => data);
  },
  getList: function (page: number, perPage: number, filter: any): Promise<any[]> {
    throw new Error('Function not implemented.');
  },
  async saveOrUpdate(resources: any): Promise<any[]> {
    const { files, fileId, fileType } = resources;

    const { accountId } = getCached.userInfo();
    const binaryFile = await toArrayBuffer(files);
    const type = getMimeType(files);

    return FileApi()
      .uploadFile(accountId, fileId, binaryFile, fileType, { headers: { 'Content-Type': type } })
      .then(({ data }) => [data]);
  },
};
