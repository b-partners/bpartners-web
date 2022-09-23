import { BpDataProviderType } from './bp-data-provider-type';
import { FileApi } from './api';
import authProvider from './auth-provider';

export const filesProvider: BpDataProviderType = {
  async getOne(id: string) {
    return FileApi()
      .getFileById(id)
      .then(({ data }) => data);
  },
  getList: function (page: number, perPage: number, filter: any): Promise<any[]> {
    throw new Error('Function not implemented.');
  },
  async saveOrUpdate(resources: any[]): Promise<any[]> {
    const logoFiledId = authProvider.getCachedWhoami()?.user.logoFileId;
    return FileApi()
      .uploadFile(resources, logoFiledId)
      .then(data => [data]);
  },
};

