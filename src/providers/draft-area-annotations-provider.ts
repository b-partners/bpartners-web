import { areaPictureApi } from './api';
import { BpDataProviderType } from './bp-data-provider-type';
import { getCached } from './cache';

export const draftAreaPictureAnnotatorProvider: BpDataProviderType = {
  getList: async (page: number, pageSize: number, filter: { areaPictureId?: string }) => {
    const { areaPictureId } = filter;
    const { accountId } = getCached.userInfo();

    if (areaPictureId) {
      return areaPictureApi()
        .getDraftAnnotationsByAccountIdAndAreaPictureId(accountId, areaPictureId, page, pageSize)
        .then(response => response.data);
    }

    return areaPictureApi()
      .getDraftAnnotationsByAccountId(accountId, page, pageSize)
      .then(response => response.data);
  },
  getOne: () => {
    throw new Error('Not Implemented');
  },
  saveOrUpdate: () => {
    throw new Error('Not Implemented');
  },
};
