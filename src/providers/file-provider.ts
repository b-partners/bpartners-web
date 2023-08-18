import axios from 'axios';
import { FileApi, getCached } from '.';
import { getFileUrl, getMimeType, toArrayBuffer } from '../common/utils';
import { BpDataProviderType } from './bp-data-provider-type';

export const fileProvider: BpDataProviderType = {
  async getOne(id, option = {}) {
    const { fileType, fileName } = option;
    const url = getFileUrl(id, fileType);
    const response = await axios({
      url: url,
      method: 'GET',
      responseType: 'blob',
    });
    // get the file extension
    const contentType = response.headers['content-type'];
    const fileExtension = contentType ? contentType.split('/')[1] : '';
    // create a element to download the file
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(new Blob([response.data]));
    link.download = `${fileName}.${fileExtension}`;
    link.click();
    window.URL.revokeObjectURL(link.href);
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
