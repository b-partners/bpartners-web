import { BPButton } from '@/common/components';
import { useAnnotatorExportAsPdf, useAnnotatorImageUploadQuery } from '@/common/fetcher';
import { useToggle } from '@/common/hooks';
import { useCanvasAnnotationContext } from '@/common/store';
import { getFileUrl, useWrappedSearchParams } from '@/common/utils';
import { AreaPictureDetails } from '@bpartners/typescript-client';
import { FC, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { AnnotationInfo } from '../types';

export interface ExportAnnotationConfirmButtonProps {
  formState: UseFormReturn<{ annotationInfos: AnnotationInfo[] }, any, undefined>;
  areaPictureDetails: AreaPictureDetails;
  image: string;
  isCropped: boolean;
}

export const ExportAnnotationConfirmButton: FC<ExportAnnotationConfirmButtonProps> = ({ areaPictureDetails, image, isCropped }) => {
  const { address } = useWrappedSearchParams(['imgUrl', 'address']);
  const { handleClose: closeConfirm } = useToggle();
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
        onClick={doAnnotationExport}
        isLoading={isLoading}
        disabled={isLoading || polygons.length === 0}
        label='resources.draftsAnnotations.export'
        data-testid='submit-annotation-export'
      />
    </>
  );
};
