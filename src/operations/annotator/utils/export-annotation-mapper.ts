import { emptyToNull } from '@/common/utils';
import { getCached } from '@/providers';
import { getColorFromMain, Measurement, Polygon } from '@bpartners/annotator-component';
import { ExportAreaPictureAnnotation, ExportAreaPictureAnnotationMeasurement } from '@bpartners/typescript-client';
import { AnnotationInfo } from '../types';
import { createDefaultAnnotationInfo } from './annotation-info-mapper';
import { translateAnnotationInfo } from './annotation-info-translator';

export type ExportAnnotationMapperArgs = {
  imageUrl: string;
  address: string;
  polygons: Polygon[];
  annotationInfos: AnnotationInfo[];
  globalRateType: string;
  globalRateValue: number;
};

export const exportAnnotationMapper = ({
  annotationInfos,
  imageUrl,
  address,
  polygons,
  globalRateType,
  globalRateValue,
}: ExportAnnotationMapperArgs): ExportAreaPictureAnnotation => {
  return {
    imageUrl,
    address,
    globalRateType,
    globalRateValue,
    llm: getCached.llmResult(),
    annotations: polygons.map((polygon, index) => {
      const annotationInfo = annotationInfos.find(info => info.polygonId === polygon.id) ?? createDefaultAnnotationInfo(polygon, index);

      const annotatorLabelSplitted = polygon.id.split('___');

      const { fillColor, strokeColor } = getColorFromMain('#00ff00');

      return {
        polygon,
        labelName: annotationInfo?.labelName,
        fillColor: polygon?.fillColor?.length !== 0 ? polygon?.fillColor : fillColor,
        strokeColor: polygon?.strokeColor?.length !== 0 ? polygon?.strokeColor : strokeColor,
        measurements: polygon.measurements?.slice(1).map(exportMeasurementMapper) || polygon.points.map(() => ({ isInvisible: true, unit: 'm', value: 0 })),
        infos: [
          ...translateAnnotationInfo({ ...emptyToNull(annotationInfo), area: polygon.surface }),
          { label: 'key', value: annotatorLabelSplitted.length === 2 ? annotatorLabelSplitted[1] : annotationInfo.labelName },
        ],
      };
    }),
  };
};

const exportMeasurementMapper = (measurement: Measurement): ExportAreaPictureAnnotationMeasurement => {
  return {
    unit: measurement.unity,
    value: parseFloat(measurement.value.toFixed(2)),
    isInvisible: measurement.isInvisible,
  };
};
