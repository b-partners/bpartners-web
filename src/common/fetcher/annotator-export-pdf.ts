import { AnnotationInfo } from '@/operations/annotator';
import { cityJsonMapper, exportAnnotationMapper, ExportAnnotationMapperArgs } from '@/operations/annotator/utils';
import { areaPictureApi, getCached } from '@/providers';
import { ExportAreaPictureAnnotation } from '@bpartners/typescript-client';
import { useMutation } from '@tanstack/react-query';
import { useNotify } from 'react-admin';
import { v4 } from 'uuid';
import { useAnnotator3DStore } from '../store';
import { downloadPdf, jsonToFile, sentryErrorLogger } from '../utils';

const mapExportAnnotationInfoArea = (annotationInfos: AnnotationInfo[]) => {
  const validAnnotationInfos = (annotationInfos ?? []).filter((info): info is AnnotationInfo => Boolean(info?.polygonId));
  const labelNames: Record<string, number> = {};

  validAnnotationInfos.forEach(({ area, polygonId }) => {
    const labelNameSplitted = polygonId.split('___');

    if (labelNameSplitted.length > 0) {
      labelNames[labelNameSplitted[1]] = (area || 0) + (labelNames[labelNameSplitted[1]] || 0);
    }
  });

  return validAnnotationInfos.map(annotationInfo => {
    const currentLabeNameSplitted = annotationInfo.polygonId.split('___');

    if (currentLabeNameSplitted.length === 0) {
      return annotationInfo;
    }

    return { ...annotationInfo, area: labelNames[currentLabeNameSplitted[1]] };
  });
};

interface Params {
  onSuccess?: () => void;
  onError?: () => void;
}

export const useAnnotatorExportAsPdf = (params: Params) => {
  const notify = useNotify();
  const { imageUrl, cityJsonModel } = useAnnotator3DStore();
  let exportAreaPictureAnnotation: ExportAreaPictureAnnotation = undefined;

  const mutationFn = async (params: ExportAnnotationMapperArgs) => {
    const { accountId } = getCached.userInfo();

    const shouldAdd3d = imageUrl && cityJsonModel;

    const exportAnnotation3D = shouldAdd3d ? cityJsonMapper.toExportAreaPictureAnnotation3D(cityJsonModel) : undefined;

    exportAreaPictureAnnotation = await exportAnnotationMapper({ ...params, annotationInfos: mapExportAnnotationInfoArea(params.annotationInfos) });

    exportAreaPictureAnnotation['3d'] = exportAnnotation3D;

    const { data } = await areaPictureApi().exportAreaPictureAnnotationToPdf(
      accountId,
      shouldAdd3d ? imageUrl : undefined,
      jsonToFile(exportAreaPictureAnnotation)
    );
    const { value } = data;
    await downloadPdf(value, `Rapport d'analyse - ${params.address} - ${v4().slice(0, 8)}.pdf`);
  };

  const onSuccess = () => notify('Le rapport sera envoyé à votre adresse email dans quelques instants.');
  const onError = (error: any) => {
    const message = error?.response?.data?.message ?? error?.message ?? 'Erreur inconnue';
    try {
      sentryErrorLogger(message, { payload: exportAreaPictureAnnotation });
    } finally {
      notify("Une erreur s'est produite lors de l'exportation du rapport d'analyse.\n" + message, { type: 'error', multiLine: true });
    }
  };

  return useMutation({ mutationFn, onSuccess, onError, ...params });
};
