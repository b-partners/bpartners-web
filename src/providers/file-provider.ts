import { FileApi } from './api';
import { BpDataProviderType } from './bp-data-provider-type';
import { toArrayBuffer } from '../utils/to-array-buffer';
import { getMimeType } from '../utils/get-mime-type';
import { getUserInfo } from './invoice-provider';

export const fileProvider: BpDataProviderType = {
  async getOne(id: string) {
    const { accountId } = await getUserInfo();
    return FileApi()
      .getFileById(accountId, id)
      .then(({ data }) => data);
  },
  getList: function (page: number, perPage: number, filter: any): Promise<any[]> {
    throw new Error('Function not implemented.');
  },
  async saveOrUpdate(resources: any): Promise<any[]> {
    const { accountId } = await getUserInfo();
    const binaryFile = await toArrayBuffer(resources);
    const type = getMimeType(resources);

    return FileApi()
      .uploadFile(binaryFile, accountId, 'logo.jpeg', 'LOGO', { headers: { 'Content-Type': type } })
      .then(({ data }) => [data]);
  },
};
