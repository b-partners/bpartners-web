import { AnnotationInfo } from '@/operations/annotator';
import { exportAnnotationMapper, ExportAnnotationMapperArgs } from '@/operations/annotator/utils';
import { areaPictureApi, getCached } from '@/providers';
import { useMutation } from '@tanstack/react-query';
import { useNotify } from 'react-admin';
import { downloadPdf } from '../utils';

const mapExportAnnotationInfoArea = (annotationInfos: AnnotationInfo[]) => {
  const labelNames: Record<string, number> = {};

  annotationInfos.forEach(({ area, polygonId }) => {
    const labelNameSplitted = polygonId.split('___');

    if (labelNameSplitted.length > 0) {
      labelNames[labelNameSplitted[1]] = area + (labelNames[labelNameSplitted[1]] || 0);
    }
  });

  return annotationInfos.map(annotationInfo => {
    const currentLabeNameSplitted = annotationInfo.polygonId.split('___');

    if (currentLabeNameSplitted.length === 0) {
      return annotationInfo;
    }

    return { ...annotationInfo, area: labelNames[currentLabeNameSplitted[1]] };
  });
};

const mutationFn = async (params: ExportAnnotationMapperArgs) => {
  const { accountId } = getCached.userInfo();
  const exportAreaPictureAnnotation = exportAnnotationMapper({ ...params, annotationInfos: mapExportAnnotationInfoArea(params.annotationInfos) });
  const { data } = await areaPictureApi().exportAreaPictureAnnotationToPdf(accountId, exportAreaPictureAnnotation);
  const { value } = data;
  downloadPdf(value, `Rapport d'analyse - ${params.address}.pdf`);
};

interface Params {
  onSuccess?: () => void;
  onError?: () => void;
}

export const useAnnotatorExportAsPdf = (params: Params) => {
  const notify = useNotify();

  const onSuccess = () => notify('Le rapport sera envoyé à votre adresse email dans quelques instants.');
  const onError = () => notify("Une erreur s'est produite lors de l'exportation du rapport d'analyse.", { type: 'error' });

  return useMutation({ mutationFn, onSuccess, onError, ...params });
};
