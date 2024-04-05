import { VerifyAdress, verifyAdressResponse } from 'src/__tests__/mocks/responses/annotator-api';
import { areaPictureApi } from './api';
import { CrupdateAreaPictureDetails } from '@bpartners/typescript-client';
import { getCached } from './cache';

// export const annotatorProvider = async () => {
//     // get polygons
//     return Promise.resolve(annotations);
//   };

export const verifyAddress = async (adress = '27 rue de la pépinière') => {
  // send adress, and receive geoPosition (longitude, latitude)
  return Promise.resolve(verifyAdressResponse);
};

export const getImageByCoordinates = async (geoposition: VerifyAdress) => {
  // send geoPosition, and receive imgUrl
  return Promise.resolve('https://capable.ctreq.qc.ca/wp-content/uploads/2017/01/exemple-image-e1486497635469.jpg');
};

export const annotatorProvider = {
  async getPictureFormAddress(id: string, crupdateAreaPictureDetails: CrupdateAreaPictureDetails) {
    const { accountId } = getCached.userInfo();
    const { data } = await areaPictureApi().downloadAndSaveAreaPicture(accountId, id, crupdateAreaPictureDetails);
    return data;
  },
};
