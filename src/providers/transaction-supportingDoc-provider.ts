import { getMimeType, toArrayBuffer } from 'src/common/utils';
import { asyncGetUserInfo, BpDataProviderType, payingApi } from '.';

export const transactionSupportingDocProvider: BpDataProviderType = {
  async getOne(id: string) {
    throw new Error('Function not implemented.');
  },
  getList: async function (page: number, perPage: number, filters = {}): Promise<any[]> {
    throw new Error('Function not implemented.');
  },
  saveOrUpdate: async function (resources: any): Promise<any> {
    const { file, tId } = resources;
    const { accountId } = await asyncGetUserInfo();
    const binaryFile = await toArrayBuffer(file);
    const type = getMimeType(file);
    return (await payingApi().addTransactionSupportingDocuments(accountId, tId, binaryFile, { headers: { 'Content-Type': type } })).data;
  },
};
