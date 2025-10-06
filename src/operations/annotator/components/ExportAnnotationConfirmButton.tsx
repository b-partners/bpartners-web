import { BPButton } from '@/common/components';
import { useAnnotatorExportAsPdf, useAnnotatorImageUploadQuery } from '@/common/fetcher';
import { useLoadingHandler, useToggle } from '@/common/hooks';
import { useCanvasAnnotationContext } from '@/common/store';
import { useWrappedSearchParams } from '@/common/utils';
import { AreaPictureDetails } from '@bpartners/typescript-client';
import { Download } from '@mui/icons-material';
import { Alert, Box } from '@mui/material';
import { FC, useState } from 'react';
import { Confirm, ConfirmProps } from 'react-admin';
import { UseFormReturn } from 'react-hook-form';
import { AnnotationInfo } from '../types';

export type ExportAnnotationConfirmButtonProps = {
  formState: UseFormReturn<{ annotationInfos: AnnotationInfo[] }, any, undefined>;
  areaPictureDetails: AreaPictureDetails;
  image: string;
  isCropped: boolean;
};

export const ExportAnnotationConfirmButton: FC<ExportAnnotationConfirmButtonProps> = ({ formState, areaPictureDetails, image, isCropped }) => {
  const { isLoading, startLoading, stopLoading } = useLoadingHandler();
  const { address, imgUrl } = useWrappedSearchParams(['imgUrl', 'address']);
  const { value: confirmStatus, handleOpen: openConfirm, handleClose: closeConfirm } = useToggle();
  const [annotationInfos, setAnnotationInfos] = useState<AnnotationInfo[]>([]);
  const { polygons } = useCanvasAnnotationContext();

  const exportPdfOnSuccess = () => {
    stopLoading();
    handleCloseConfirm();
  };

  const { mutate: exportAsPdf } = useAnnotatorExportAsPdf({ onSuccess: exportPdfOnSuccess });

  const uploadImageOnSuccess = () => {
    exportAsPdf({
      annotationInfos,
      polygons,
      address,
      imageUrl: image,
    });
  };

  const { mutateAsync: uploadImage } = useAnnotatorImageUploadQuery({ onSuccess: uploadImageOnSuccess });

  const handleSubmitForms = formState.handleSubmit(async ({ annotationInfos }) => {
    setAnnotationInfos(annotationInfos);
    openConfirm();
  });

  const handleCloseConfirm = () => {
    setAnnotationInfos([]);
    closeConfirm();
    if (isCropped) {
      return uploadImage({ file: imgUrl, id: areaPictureDetails.fileId });
    }
    uploadImageOnSuccess();
  };

  const doAnnotationExport = async () => {
    startLoading();
    handleCloseConfirm();
  };

  return (
    <>
      <BPButton
        type='submit'
        className='export-analyse-btn'
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
