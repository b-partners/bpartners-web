import { AreaPictureAnnotation, CrupdateAreaPictureDetails } from '@bpartners/typescript-client';
import { areaPictureApi } from './api';
import { getCached } from './cache';

interface GetAllAreaPicturesParams {
  page?: number;
  pageSize?: number;
  address?: string;
  filename?: string;
}

export const annotatorProvider = {
  async getPictureFormAddress(pictureId: string, crupdateAreaPictureDetails: CrupdateAreaPictureDetails) {
    const { accountId } = getCached.userInfo();
    const { data } = await areaPictureApi().crupdateAreaPictureDetails(accountId, pictureId, {
      ...crupdateAreaPictureDetails,
      shiftRight: false,
      shiftLeft: false,
      shiftNb: 0,
    } as any);
    return data;
  },
  async getAreaPictureById(pictureId: string) {
    const { accountId } = getCached.userInfo();
    const { data } = await areaPictureApi().getAreaPictureById(accountId, pictureId);
    return data;
  },
  async getAllAreaPictures(params: GetAllAreaPicturesParams) {
    const { address, filename, page, pageSize } = params;
    const { accountId } = getCached.userInfo();
    const { data } = await areaPictureApi().getAllAreaPictures(accountId, page, pageSize, address, filename);
    return data;
  },
  async annotatePicture(pictureId: string, annotationId: string, newDataMapped: AreaPictureAnnotation) {
    const { accountId } = getCached.userInfo();
    const { data } = await areaPictureApi().annotateAreaPicture(accountId, pictureId, annotationId, newDataMapped);
    return data;
  },
  async getAnnotationPicture(pictureId: string, annotationId: string) {
    const { accountId } = getCached.userInfo();
    const { data } = await areaPictureApi().getAreaPictureAnnotation(accountId, pictureId, annotationId);
    return data;
  },
  async getAnnotationsPicture(pictureId: string) {
    const { accountId } = getCached.userInfo();
    const { data } = await areaPictureApi().getAreaPictureAnnotations(accountId, pictureId);
    return data;
  },
};
