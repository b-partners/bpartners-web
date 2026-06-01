import { areaPictureApi } from './api';
import { BpDataProviderType } from './bp-data-provider-type';
import { getCached } from './cache';

export const saveUserAnnotationProvider: BpDataProviderType = {
  async saveOrUpdate(resources: any[]) {
    const { pictureId, annotationId, newDataMapped } = resources[0];
    const { accountId } = getCached.userInfo();
    const { data } = await areaPictureApi().annotateAreaPicture(accountId, pictureId, annotationId, newDataMapped);
    return data;
  },
  async getOne(pictureId: string) {
    const { accountId } = getCached.userInfo();
    const { data } = await areaPictureApi().getAreaPictureAnnotations(accountId, pictureId);
    return data;
  },
  getList: function (): Promise<Array<any>> {
    throw new Error('Function not implemented.');
  },
};
