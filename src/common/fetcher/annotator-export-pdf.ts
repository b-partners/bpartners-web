import { exportAnnotationMapper, ExportAnnotationMapperArgs } from '@/operations/annotator/utils';
import { areaPictureApi, getCached } from '@/providers';
import { useMutation } from '@tanstack/react-query';
import { useNotify } from 'react-admin';
import { downloadPdf } from '../utils';

const mutationFn = async (params: ExportAnnotationMapperArgs) => {
  const { accountId } = getCached.userInfo();
  const exportAreaPictureAnnotation = exportAnnotationMapper(params);
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
