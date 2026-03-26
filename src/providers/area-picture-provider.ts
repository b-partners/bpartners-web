import { copyObject } from '@/common/utils';
import { areaPictureApi } from './api';
import { BpDataProviderType } from './bp-data-provider-type';
import { getCached } from './cache';

export const areaPictureDetailsProvider: BpDataProviderType = {
  getList: function (page: number, perPage: number, filter: any): Promise<Array<any>> {
    throw new Error('Function not implemented.');
  },
  getOne: function (id?: string, option?: any): Promise<any> {
    throw new Error('Function not implemented.');
  },
  async saveOrUpdate(resources: any): Promise<Array<any>> {
    const { accountId } = getCached.userInfo();
    const pictureId = resources[0].id;
    const areaPictureDetails = copyObject(resources[0]);
    delete areaPictureDetails.id;

    console.log(resources);

    const { data } = await areaPictureApi().crupdateAreaPictureDetails(accountId, pictureId, {
      shiftNb: 0,
      ...areaPictureDetails,
      isOpaque: false,
    } as any);
    return [data];
  },
};
