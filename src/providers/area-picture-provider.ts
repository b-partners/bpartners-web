import { copyObject } from '@/common/utils';
import { areaPictureApi } from './api';
import { BpDataProviderType } from './bp-data-provider-type';
import { getCached } from './cache';

export const areaPictureDetailsProvider: BpDataProviderType = {
  getList: function (): Promise<Array<any>> {
    throw new Error('Function not implemented.');
  },
  async getOne(id?: string): Promise<any> {
    const { accountId } = getCached.userInfo();
    const { data } = await areaPictureApi().getAreaPictureById(accountId, id);
    return data;
  },
  async saveOrUpdate(resources: any): Promise<Array<any>> {
    const { accountId } = getCached.userInfo();
    const pictureId = resources[0].id;
    const areaPictureDetails = copyObject(resources[0]);
    delete areaPictureDetails.id;

    const { data } = await areaPictureApi().crupdateAreaPictureDetails(accountId, pictureId, {
      shiftNb: 0,
      ...areaPictureDetails,
      isOpaque: false,
    } as any);
    return [data];
  },
};
