import { BPButton } from '@/common/components';
import { useAnnotatorExportAsPdf, useAnnotatorImageUploadQuery } from '@/common/fetcher';
import { useToggle } from '@/common/hooks';
import { annotatorStore, useAnnotatorComponentStore } from '@/common/store';
import { getFileUrl, useWrappedSearchParams } from '@/common/utils';
import { getAnalyseImageFileId } from '@/constants';
import { AreaPictureDetails } from '@bpartners/typescript-client';
import { FC } from 'react';
import { calculateGlobalRate } from '../utils';

export interface ExportAnnotationConfirmButtonProps {
  areaPictureDetails: AreaPictureDetails;
  image: string;
  isCropped: boolean;
  disabled?: boolean;
}

export const ExportAnnotationConfirmButton: FC<ExportAnnotationConfirmButtonProps> = ({ areaPictureDetails, image, isCropped, disabled = false }) => {
  const { address } = useWrappedSearchParams(['imgUrl', 'address']);
  const { handleClose: closeConfirm } = useToggle();
  const annotationInfos = annotatorStore.useAnalyseAnnotatorInfoStore();
  const { polygonList } = annotatorStore.useAnalysePolygonStore();
  const { analyseImageUrl } = useAnnotatorComponentStore();

  const exportPdfOnSuccess = () => {
    closeConfirm();
  };

  const { mutate: exportAsPdf, isPending: exportAsPdfPending } = useAnnotatorExportAsPdf({ onSuccess: exportPdfOnSuccess });

  const uploadImageOnSuccess = () => {
    const globalRate = calculateGlobalRate();
    const imageUrl = analyseImageUrl
      ? getFileUrl(getAnalyseImageFileId(areaPictureDetails.fileId), 'AREA_PICTURE')
      : getFileUrl(areaPictureDetails.fileId, 'AREA_PICTURE');
    exportAsPdf({
      annotationInfos,
      polygons: polygonList,
      address,
      imageUrl,
      globalRateType: globalRate.type,
      globalRateValue: globalRate.value,
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
