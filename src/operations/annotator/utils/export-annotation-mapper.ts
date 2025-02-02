import { emptyToNull } from '@/common/utils';
import { Measurement, Polygon } from '@bpartners/annotator-component';
import { ExportAreaPictureAnnotation, ExportAreaPictureAnnotationMeasurement } from '@bpartners/typescript-client';
import { AnnotationInfo } from '../types';
import { createDefaultAnnotationInfo } from './annotation-info-mapper';
import { translateAnnotationInfo } from './annotation-info-translator';

export type ExportAnnotationMapperArgs = {
  imageUrl: string;
  address: string;
  polygons: Polygon[];
  annotationInfos: AnnotationInfo[];
};

export const exportAnnotationMapper = ({ annotationInfos, imageUrl, address, polygons }: ExportAnnotationMapperArgs): ExportAreaPictureAnnotation => {
  return {
    imageUrl,
    address,
    annotations: polygons.map((polygon, index) => {
      const annotationInfo = annotationInfos.find(info => info.polygonId === polygon.id) ?? createDefaultAnnotationInfo(polygon.id, index);

      return {
        polygon,
        labelName: annotationInfo?.labelName,
        fillColor: polygon?.fillColor,
        strokeColor: polygon?.strokeColor,
        measurements: polygon.measurements?.slice(1).map(exportMeasurementMapper),
        infos: translateAnnotationInfo({ ...emptyToNull(annotationInfo), area: polygon.surface }),
      };
    }),
  };
};

const exportMeasurementMapper = (measurment: Measurement): ExportAreaPictureAnnotationMeasurement => {
  return {
    unit: measurment.unity,
    value: measurment.value,
    isInvisible: measurment.isInvisible,
  };
};
