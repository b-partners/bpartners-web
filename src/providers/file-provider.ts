import { BpDataProviderType } from './bp-data-provider-type';
import { FileApi } from './api';

export const filesProvider: BpDataProviderType = {
  async getOne(id: string) {
    return FileApi()
      .getFileById(id)
      .then(({ data }) => data);
  },
  getList: function (page: number, perPage: number, filter: any): Promise<any[]> {
    throw new Error('Function not implemented.');
  },
  saveOrUpdate: function (resources: any[]): Promise<any[]> {
    throw new Error('Function not implemented.');
  },
};

