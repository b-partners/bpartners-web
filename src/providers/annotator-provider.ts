import { CrupdateAreaPictureDetails } from '@bpartners/typescript-client';
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
    const { data } = await areaPictureApi().downloadAndSaveAreaPicture(accountId, pictureId, crupdateAreaPictureDetails);
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
};
