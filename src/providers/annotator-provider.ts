import { VerifyAdress, annotations, verifyAdressResponse } from "src/__tests__/mocks/responses/annotator-api";

export const annotatorProvider = async () => {
    // get polygons
    return Promise.resolve(annotations);
  };

export const verifyAddress = async (adress='27 rue de la pépinière') => {
    // send adress, and receive geoPosition (longitude, latitude)
    return Promise.resolve(verifyAdressResponse);
}

export const getImageByCoordinates = async (geoposition: VerifyAdress) => {
    // send geoPosition, and receive imgUrl
    return Promise.resolve("https://capable.ctreq.qc.ca/wp-content/uploads/2017/01/exemple-image-e1486497635469.jpg");
}