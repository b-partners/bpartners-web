import { BPButton } from '@/common/components';
import { useAnnotatorExportAsPdf, useAnnotatorImageUploadQuery } from '@/common/fetcher';
import { useToggle } from '@/common/hooks';
import { useCanvasAnnotationContext } from '@/common/store';
import { getFileUrl, useWrappedSearchParams } from '@/common/utils';
import { AreaPictureDetails } from '@bpartners/typescript-client';
import { Download } from '@mui/icons-material';
import { Alert, Box } from '@mui/material';
import { FC, useState } from 'react';
import { Confirm, ConfirmProps } from 'react-admin';
import { UseFormReturn } from 'react-hook-form';
import { AnnotationInfo } from '../types';
import { ExportAnnotationMapperArgs } from '../utils';

export interface ExportAnnotationConfirmButtonProps extends Pick<ExportAnnotationMapperArgs, 'globalRateType' | 'globalRateValue'> {
  formState: UseFormReturn<{ annotationInfos: AnnotationInfo[] }, any, undefined>;
  areaPictureDetails: AreaPictureDetails;
  image: string;
  isCropped: boolean;
}

export const ExportAnnotationConfirmButton: FC<ExportAnnotationConfirmButtonProps> = ({ formState, areaPictureDetails, image, isCropped }) => {
  const { address } = useWrappedSearchParams(['imgUrl', 'address']);
  const { value: confirmStatus, handleOpen: openConfirm, handleClose: closeConfirm } = useToggle();
  const [annotationInfos, setAnnotationInfos] = useState<AnnotationInfo[]>([]);
  const { polygons } = useCanvasAnnotationContext();
  const { roofAnalyseProperties } = useCanvasAnnotationContext();

  const exportPdfOnSuccess = () => {
    setAnnotationInfos([]);
    closeConfirm();
  };

  const { mutate: exportAsPdf, isPending: exportAsPdfPending } = useAnnotatorExportAsPdf({ onSuccess: exportPdfOnSuccess });

  const uploadImageOnSuccess = () => {
    exportAsPdf({
      annotationInfos,
      polygons,
      address,
      imageUrl: getFileUrl(areaPictureDetails.fileId, 'AREA_PICTURE'),
      globalRateType: roofAnalyseProperties?.global_rate_type || '',
      globalRateValue: roofAnalyseProperties?.global_rate_value || 0,
    });
  };

  const { mutateAsync: uploadImage, isPending: uploadIsPending } = useAnnotatorImageUploadQuery({ onSuccess: uploadImageOnSuccess });

  const isLoading = exportAsPdfPending || uploadIsPending;

  const handleSubmitForms = formState.handleSubmit(async ({ annotationInfos }) => {
    setAnnotationInfos(annotationInfos);
    openConfirm();
  });

  const handleCloseConfirm = () => {
    setAnnotationInfos([]);
    closeConfirm();
    if (isCropped) {
      return uploadImage({ file: image, id: areaPictureDetails.fileId });
    }
    uploadImageOnSuccess();
  };

  const doAnnotationExport = async () => {
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
