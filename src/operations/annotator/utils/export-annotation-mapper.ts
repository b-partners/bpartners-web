import { emptyToNull, getFileUrl } from '@/common/utils';
import { analyseGeneratedIdRef, roofGlobalIdRef } from '@/operations/prospects/constants';
import { getCached, saveOrUpdateLanding } from '@/providers';
import { getColorFromMain, Measurement, Polygon } from '@bpartners/annotator-component';
import { ExportAreaPictureAnnotation, ExportAreaPictureAnnotationMeasurement } from '@bpartners/typescript-client';
import { v4 } from 'uuid';
import { AnnotationInfo } from '../types';
import { createDefaultAnnotationInfo } from './annotation-info-mapper';
import { translateAnnotationInfo } from './annotation-info-translator';
import { createImage, fetchImageAsBase64, getCroppedImageAndPolygons } from './use-crop-polygon';

export type ExportAnnotationMapperArgs = {
  imageUrl: string;
  address: string;
  polygons: Polygon[];
  annotationInfos: AnnotationInfo[];
  globalRateType: string;
  globalRateValue: number;
};

export const base64ToFile = (base64: string, filename: string): { file: File; type: string } => {
  const [meta, data] = base64.split(',');
  const mime = meta.match(/:(.*?);/)?.[1] || 'image/png';
  const bytes = Uint8Array.from(atob(data), c => c.charCodeAt(0));
  const file = new File([bytes], filename, { type: mime });
  return { file, type: mime };
};

export const exportAnnotationMapper = async (props: ExportAnnotationMapperArgs): Promise<ExportAreaPictureAnnotation> => {
  const { annotationInfos, imageUrl: _imageUrl, address, polygons: _polygons, globalRateType, globalRateValue } = props;
  let imageUrl = _imageUrl;
  let polygons = _polygons;

  if (!globalRateType) {
    const imageAsBase64 = await fetchImageAsBase64(imageUrl);
    const image = await createImage(imageAsBase64);
    const { image: croppedImage, polygons: croppedPolygons } = getCroppedImageAndPolygons(polygons as any, polygons as any, image);
    const fileId = v4();
    const { file, type } = base64ToFile(croppedImage, fileId + '.png');
    await saveOrUpdateLanding(fileId, file, type);
    polygons = croppedPolygons;
    imageUrl = getFileUrl(fileId, 'ATTACHMENT');
  }

  const annotations = polygons.map((polygon, index) => {
    const annotationInfo = annotationInfos.find(info => info.polygonId === polygon.id) ?? createDefaultAnnotationInfo(polygon, index);

    const annotatorLabelSplitted = polygon.id.split('___');

    const { fillColor, strokeColor } = getColorFromMain('#00ff00');

    return {
      polygon,
      labelName: annotationInfo?.labelName,
      fillColor: polygon?.fillColor?.length !== 0 ? polygon?.fillColor : fillColor,
      strokeColor: polygon?.strokeColor?.length !== 0 ? polygon?.strokeColor : strokeColor,
      measurements:
        polygon.measurements.map(exportMeasurementMapper(polygon.id || '')) || polygon.points.map(() => ({ isInvisible: true, unit: 'm', value: 0 })),
      infos: [
        ...translateAnnotationInfo({
          ...emptyToNull(annotationInfo),
          area: polygon.id.includes(roofGlobalIdRef) ? annotationInfo.area || polygon.surface : polygon.surface || annotationInfo.area,
        }),
        { label: 'key', value: annotatorLabelSplitted.length === 2 ? annotatorLabelSplitted[1] : annotationInfo.labelName },
      ],
    };
  });

  const roofAnnotation = annotations.find(a => a?.polygon?.id?.includes(roofGlobalIdRef));

  return {
    imageUrl,
    address,
    globalRateType,
    globalRateValue,
    llm: getCached.llmResult(),
    annotations: !roofAnnotation ? annotations : [roofAnnotation, ...annotations.filter(a => !a.polygon.id.includes(roofGlobalIdRef))],
  };
};

const exportMeasurementMapper =
  (polygonId: string) =>
  (measurement: Measurement): ExportAreaPictureAnnotationMeasurement => {
    return {
      unit: measurement.unity,
      value: parseFloat(measurement.value.toFixed(2)),
      isInvisible: polygonId.includes(analyseGeneratedIdRef),
    };
  };
