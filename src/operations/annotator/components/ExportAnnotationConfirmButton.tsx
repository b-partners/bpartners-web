import { BPButton } from '@/common/components';
import { useAnnotatorExportAsPdf, useAnnotatorImageUploadQuery } from '@/common/fetcher';
import { useToggle } from '@/common/hooks';
import { annotatorStore, useAnnotatorComponentStore } from '@/common/store';
import { getFileUrl, useWrappedSearchParams } from '@/common/utils';
import { AreaPictureDetails } from '@bpartners/typescript-client';
import { FC } from 'react';

export interface ExportAnnotationConfirmButtonProps {
  areaPictureDetails: AreaPictureDetails;
  image: string;
  isCropped: boolean;
  disabled?: boolean;
}

export const ExportAnnotationConfirmButton: FC<ExportAnnotationConfirmButtonProps> = ({ areaPictureDetails, image, isCropped, disabled = false }) => {
  const { address } = useWrappedSearchParams(['imgUrl', 'address']);
  const { handleClose: closeConfirm } = useToggle();
  const { roofAnalyseProperties } = useAnnotatorComponentStore();
  const annotationInfos = annotatorStore.useAnnotatorInfoStore();
  const { polygonList } = annotatorStore.usePolygonStore();

  const exportPdfOnSuccess = () => {
    closeConfirm();
  };

  const { mutate: exportAsPdf, isPending: exportAsPdfPending } = useAnnotatorExportAsPdf({ onSuccess: exportPdfOnSuccess });

  const uploadImageOnSuccess = () => {
    exportAsPdf({
      annotationInfos,
      polygons: polygonList,
      address,
      imageUrl: getFileUrl(areaPictureDetails.fileId, 'AREA_PICTURE'),
      globalRateType: roofAnalyseProperties?.global_rate_type || '',
      globalRateValue: roofAnalyseProperties?.global_rate_value || 0,
    });
  };

  const { mutateAsync: uploadImage, isPending: uploadIsPending } = useAnnotatorImageUploadQuery({ onSuccess: uploadImageOnSuccess });

  const isLoading = exportAsPdfPending || uploadIsPending;

  const handleCloseConfirm = () => {
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
    <BPButton
      type='submit'
      className='export-analyse-btn'
      onClick={doAnnotationExport}
      isLoading={isLoading}
      disabled={isLoading || disabled}
      label='resources.draftsAnnotations.export'
      data-testid='submit-annotation-export'
    />
  );
};
