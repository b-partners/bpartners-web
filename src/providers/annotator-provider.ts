import { AreaPictureAnnotation, CrupdateAreaPictureDetails } from '@bpartners/typescript-client';
import { addressAutocompletionApi, areaPictureApi } from './api';
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
      shiftNb: 0,
      ...crupdateAreaPictureDetails,
      isOpaque: false,
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
  async searchAddress(query: string) {
    const { accountId } = getCached.userInfo();
    const { data } = await addressAutocompletionApi().autoCompleteAddress(query, accountId);
    return data.map(({ description }: any) => description);
  },
  async pointsToGeoPoints(body: any) {
    try {
      const res = await fetch(`${process.env.REACT_APP_ANNOTATOR_GEO_MERCATOR_API_URL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      return await res.json();
    } catch (error) {
      console.log(error);
      return null;
    }
  },
  async geoPointsToPoins(geoJson: any) {
    try {
      const { accountId } = getCached.userInfo();
      const { data } = await areaPictureApi().convertAreaPictureAnnotationsToPixel(accountId, geoJson);
      return data;
    } catch (error) {
      console.log(error);
    }
  },
};
