import _ from 'lodash';
import { areaPictureApi } from './api';
import { BpDataProviderType } from './bp-data-provider-type';
import { getCached } from './cache';

interface DraftAreaPictureAnnotationFilter {
  areaPictureId?: string;
  prospectName?: string;
  address?: string;
  creationFrom?: string;
  creationTo?: string;
  sort?: unknown;
}

const toInstant = (dateTime: string) => `${dateTime}:00.000Z`;

export const draftAreaPictureAnnotatorProvider: BpDataProviderType = {
  getList: async (page: number, pageSize: number, filter: DraftAreaPictureAnnotationFilter) => {
    const { areaPictureId, sort: _sort, creationFrom, creationTo, ...restFilters } = filter;
    const { accountId } = getCached.userInfo();
    // @bpartners/typescript-client has no typed params for these filters yet; pass them as raw query params until the SDK is regenerated.
    const params = _.omitBy(
      {
        ...restFilters,
        creationFrom: creationFrom ? toInstant(creationFrom) : undefined,
        creationTo: creationTo ? toInstant(creationTo) : undefined,
      },
      _.isNil
    );

    if (areaPictureId) {
      return areaPictureApi()
        .getDraftAnnotationsByAccountIdAndAreaPictureId(accountId, areaPictureId, page, pageSize, { params })
        .then(response => response.data);
    }

    return areaPictureApi()
      .getDraftAnnotationsByAccountId(accountId, page, pageSize, { params })
      .then(response => response.data);
  },
  getOne: async (pictureId: string) => {
    const { accountId } = getCached.userInfo();
    const { data } = await areaPictureApi().getDraftAnnotationsByAccountIdAndAreaPictureId(accountId, pictureId, 1, 1);
    const draftAnnotation = data?.[0];
    return { ...draftAnnotation, draftId: draftAnnotation?.id, id: pictureId };
  },
  saveOrUpdate: async (annotations: any, options: any) => {
    const { accountId } = getCached.userInfo();
    const { data } = await areaPictureApi().annotateAreaPicture(accountId, options.meta.pictureId, options.meta.annotationId, annotations[0]);
    return [data];
  },
};
