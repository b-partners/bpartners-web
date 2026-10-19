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
// creationFrom/creationTo are sent as raw query params too: passing them as typed Date args makes the
// generated client double-encode the value (colons end up as a literal "%3A" the backend can't parse),
// so we pre-format them as ISO strings and pass them alongside lite until the SDK serialization is fixed.
const buildOptions = (creationFrom?: string, creationTo?: string) => ({
  params: {
    lite: true,
    ...(creationFrom && { creationFrom: toInstant(creationFrom) }),
    ...(creationTo && { creationTo: toInstant(creationTo) }),
  },
});

export const draftAreaPictureAnnotatorProvider: BpDataProviderType = {
  getList: async (page: number, pageSize: number, filter: DraftAreaPictureAnnotationFilter) => {
    const { areaPictureId, sort: _sort, prospectName, address, creationFrom, creationTo } = filter;
    const { accountId } = getCached.userInfo();
    const options = buildOptions(creationFrom, creationTo);

    if (areaPictureId) {
      return areaPictureApi()
        .getDraftAnnotationsByAccountIdAndAreaPictureId(
          accountId,
          areaPictureId,
          page,
          pageSize,
          prospectName,
          address,
          undefined,
          undefined,
          undefined,
          options
        )
        .then(response => response.data);
    }

    return areaPictureApi()
      .getDraftAnnotationsByAccountId(accountId, page, pageSize, prospectName, address, undefined, undefined, undefined, options)
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
