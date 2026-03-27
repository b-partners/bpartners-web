import { AreaPictureDetails } from '@bpartners/typescript-client';

// Used to force AnnotatorComponent to refresh when areaPictureDetails change
export const refreshImageUrl = (url: string, areaPictureDetails: AreaPictureDetails) =>
  `${url}` +
  `&isExtended=${areaPictureDetails.isExtended}` +
  `&zoom=${areaPictureDetails?.zoom?.number}` +
  `&layer=${areaPictureDetails?.actualLayer?.id}` +
  `&shiftNb=${areaPictureDetails.shiftNb}` +
  `&shiftDirection=${areaPictureDetails.shiftDirection}`;
