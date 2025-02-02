import { BPButton } from '@/common/components';
import { useLoadingHandler, useToggle } from '@/common/hooks';
import { useCanvasAnnotationContext } from '@/common/store';
import { printError, useWrappedSearchParams } from '@/common/utils';
import { downloadBlobFile } from '@/common/utils/download-blob-file';
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

const createExportFileName = (address: string) => {
  return `Rapport d'Analyse de l'adresse : ${address}`;
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
    notify("Exportation du rapport d'analyse en cours...");
    handleCloseConfirm();
    try {
      const exporAreaPictureAnnotation = exportAnnotationMapper({
        annotationInfos,
        polygons,
        address,
        imageUrl: imgUrl,
      });
      const response = await areaPictureApi().exportAreaPictureAnnotationToPdf(accountId, exporAreaPictureAnnotation, { responseType: 'blob' });
      await downloadBlobFile(response.data, createExportFileName(address));
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
        title="Exportation du rapport d'analyse"
        content={
          <Box>
            <Alert severity='warning'>Veuillez vous assurer que les mesures de l'annotation sont affichées avant d'exporter l'analyse.</Alert>
          </Box>
        }
      />
    </>
  );
};
