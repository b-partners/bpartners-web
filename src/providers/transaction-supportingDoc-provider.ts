import { getMimeType, toArrayBuffer } from 'src/common/utils';
import { BpDataProviderType, asyncGetUserInfo, payingApi } from '.';

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
    const data = (await payingApi().addTransactionSupportingDocuments(accountId, tId, binaryFile, { headers: { 'Content-Type': type } })).data;
    console.log('data', data);

    return data;
  },
  archive: async (resources: any) => {
    const { accountId } = await asyncGetUserInfo();
    const { file, tId } = resources;
    const binaryFile = await toArrayBuffer(file);
    const type = getMimeType(file);
    return (await payingApi().deleteTransactionSupportingDocuments(accountId, tId, binaryFile, { headers: { 'Content-Type': type } })).data;
  },
};
