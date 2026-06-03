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
  getOne: async (pictureId: string) => {
    const { accountId } = getCached.userInfo();
    const { data } = await areaPictureApi().getDraftAnnotationsByAccountIdAndAreaPictureId(accountId, pictureId, 1, 1);
    const draftAnnotation = data?.[0];
    return { ...draftAnnotation, draftId: draftAnnotation.id, id: pictureId };
  },
  saveOrUpdate: async (annotations: any, options: any) => {
    const { accountId } = getCached.userInfo();
    const { data } = await areaPictureApi().annotateAreaPicture(accountId, options.meta.pictureId, options.meta.annotationId, annotations[0]);
    return [data];
  },
};
