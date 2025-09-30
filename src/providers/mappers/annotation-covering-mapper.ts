import { coveringTypeMap } from '@/constants';

export type AnnotationCoveringFromAnalyse =
  | 'ROOF_ARDOISE'
  | 'ROOF_ASPHALTE_BITUME'
  | 'ROOF_BAC_ACIER'
  | 'ROOF_BETON_BRUT'
  | 'ROOF_FIBRO_CIMENT'
  | 'ROOF_GRAVIER'
  | 'ROOF_MEMBRANE_SYNTHETIQUE'
  | 'ROOF_TOLE_ONDULEE'
  | 'ROOF_TUILES'
  | 'ROOF_ZINC';

export const annotationCoveringMapper = {
  fromAnalyseResultToDomainLabel(covering: AnnotationCoveringFromAnalyse) {
    return coveringTypeMap[covering] || covering || 'Autres';
  },
  fromAnalyseResultToDomain(covering: AnnotationCoveringFromAnalyse) {
    return coveringTypeMap[covering] || covering || 'Autres';
  },
};
