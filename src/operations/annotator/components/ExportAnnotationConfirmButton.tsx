import { BPButton } from '@/common/components';
import { useLoadingHandler, useToggle } from '@/common/hooks';
import { useCanvasAnnotationContext } from '@/common/store';
import { printError, useWrappedSearchParams } from '@/common/utils';
import { areaPictureApi, getCached } from '@/providers';
import { Download } from '@mui/icons-material';
import { Alert, Box } from '@mui/material';
import { FC, useState } from 'react';
import { Confirm, ConfirmProps, useNotify } from 'react-admin';
import { UseFormReturn } from 'react-hook-form';
import { AnnotationInfo } from '../types';
import { exportAnnotationMapper } from '../utils/export-annotation-mapper';

export type ExportAnnotationConfirmButtonProps = {
  formState: UseFormReturn<{ annotationInfos: AnnotationInfo[] }, any, undefined>;
};

export const ExportAnnotationConfirmButton: FC<ExportAnnotationConfirmButtonProps> = ({ formState }) => {
  const { isLoading, startLoading, stopLoading } = useLoadingHandler();
  const { address, imgUrl } = useWrappedSearchParams(['imgUrl', 'address']);
  const { accountId } = getCached.userInfo();
  const { value: confirmStatus, handleOpen: openConfirm, handleClose: closeConfirm } = useToggle();
  const [annotationInfos, setAnnotationInfos] = useState<AnnotationInfo[]>([]);
  const { polygons } = useCanvasAnnotationContext();
  const notify = useNotify();

  const handleSubmitForms = formState.handleSubmit(async ({ annotationInfos }) => {
    setAnnotationInfos(annotationInfos);
    openConfirm();
  });

  const handleCloseConfirm = () => {
    setAnnotationInfos([]);
    closeConfirm();
  };

  const doAnnotationExport = async () => {
    startLoading();
    handleCloseConfirm();
    try {
      const exporAreaPictureAnnotation = exportAnnotationMapper({
        annotationInfos,
        polygons,
        address,
        imageUrl: imgUrl,
      });
      await areaPictureApi().exportAreaPictureAnnotationToPdf(accountId, exporAreaPictureAnnotation, { responseType: 'blob' });
      notify('Le rapport sera envoyé à votre adresse email dans quelques instants.');
    } catch (error) {
      printError(error);
      notify("Une erreur s'est produite lors de l'exportation du rapport d'analyse.", { type: 'error' });
    } finally {
      stopLoading();
      handleCloseConfirm();
    }
  };

  return (
    <>
      <BPButton
        type='submit'
        style={{ width: '100%' }}
        onClick={handleSubmitForms}
        isLoading={isLoading}
        disabled={isLoading || polygons.length === 0}
        label='resources.draftsAnnotations.export'
        data-testid='submit-annotation-export'
      />
      <Confirm
        isOpen={confirmStatus}
        onClose={handleCloseConfirm}
        onConfirm={doAnnotationExport}
        confirm='Exporter'
        confirmColor={'white' as ConfirmProps['confirmColor']}
        ConfirmIcon={Download}
        title="Exportation de l'analyse"
        content={
          <Box>
            <Alert severity='warning'>Les mesures de l'annotation doivent être visibles avant de pouvoir exporter l'analyse.</Alert>
            <Alert sx={{ mt: 1 }} severity='info'>
              Dès que la soumission est complétée, vous recevrez le rapport par email.
            </Alert>
          </Box>
        }
      />
    </>
  );
};
