import { ANNOTATION_COVERING } from '@/operations/prospects/constants';

export type AnnotationCoveringFromAnalyse = 'BATI_TUILES' | 'BATI_BETON' | 'BATI_ARDOISE' | 'BATI_AUTRES';

export const annotationCoveringMapper = {
  fromAnalyseResultToDomain(covering: AnnotationCoveringFromAnalyse) {
    switch (covering) {
      case 'BATI_ARDOISE':
        return ANNOTATION_COVERING[3];
      case 'BATI_BETON':
        return ANNOTATION_COVERING[6];
      case 'BATI_TUILES':
        return ANNOTATION_COVERING[0];
      default:
        return ANNOTATION_COVERING[11];
    }
  },
};
