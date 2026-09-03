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

// lite=true skips full annotation geometry in the response: the list cards only ever read areaPicture/prospect/creationDatetime.
// @bpartners/typescript-client has no typed param for it yet, so it's passed as a raw query param until the SDK is regenerated.
const LITE_OPTIONS = { params: { lite: true } };

export const draftAreaPictureAnnotatorProvider: BpDataProviderType = {
  getList: async (page: number, pageSize: number, filter: DraftAreaPictureAnnotationFilter) => {
    const { areaPictureId, prospectName, address, creationFrom, creationTo } = filter;
    const { accountId } = getCached.userInfo();
    const fromInstant = creationFrom ? new Date(toInstant(creationFrom)) : undefined;
    const toInstantValue = creationTo ? new Date(toInstant(creationTo)) : undefined;

    if (areaPictureId) {
      return areaPictureApi()
        .getDraftAnnotationsByAccountIdAndAreaPictureId(
          accountId,
          areaPictureId,
          page,
          pageSize,
          prospectName,
          address,
          fromInstant,
          toInstantValue,
          LITE_OPTIONS
        )
        .then(response => response.data);
    }

    return areaPictureApi()
      .getDraftAnnotationsByAccountId(accountId, page, pageSize, prospectName, address, fromInstant, toInstantValue, LITE_OPTIONS)
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
