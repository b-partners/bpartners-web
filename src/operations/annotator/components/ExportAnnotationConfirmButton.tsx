import { BPButton } from '@/common/components';
import { useAnnotatorExportAsPdf, useAnnotatorImageUploadQuery } from '@/common/fetcher';
import { useToggle } from '@/common/hooks';
import { annotatorStore } from '@/common/store';
import { useDialog } from '@/common/store/dialog';
import { getFileUrl, useWrappedSearchParams } from '@/common/utils';
import { DEFAULT_EXPORT_PDF_CONF, getAnalyseImageFileId } from '@/constants';
import { AreaPictureDetails, CustomPage, ExportAreaPictureAnnotationConf } from '@bpartners/typescript-client';
import { FC, useRef } from 'react';
import { getExportableGlobalRate, useGlobalRateQuery } from '../utils';
import { ExportPdfConfDialog } from './export-pdf-conf-dialog/ExportPdfConfDialog';

export interface ExportAnnotationConfirmButtonProps {
  areaPictureDetails: AreaPictureDetails;
  image: string;
  isCropped: boolean;
  disabled?: boolean;
}

export const ExportAnnotationConfirmButton: FC<ExportAnnotationConfirmButtonProps> = ({ areaPictureDetails, image, isCropped, disabled = false }) => {
  const { address } = useWrappedSearchParams(['imgUrl', 'address']);
  const { handleClose: closeConfirm } = useToggle();
  const { open } = useDialog();
  const confRef = useRef<ExportAreaPictureAnnotationConf>(DEFAULT_EXPORT_PDF_CONF);
  const customPagesRef = useRef<CustomPage[]>([]);
  const annotationInfos = annotatorStore.useAnalyseAnnotatorInfoStore();
  const { polygonList } = annotatorStore.useAnalysePolygonStore();
  const globalRate = useGlobalRateQuery();

  const exportPdfOnSuccess = () => {
    closeConfirm();
  };

  const { mutate: exportAsPdf, isPending: exportAsPdfPending } = useAnnotatorExportAsPdf({ onSuccess: exportPdfOnSuccess });

  const uploadImageOnSuccess = () => {
    exportAsPdf({
      annotationInfos,
      polygons: polygonList,
      address,
      imageUrl: getFileUrl(getAnalyseImageFileId(areaPictureDetails.fileId), 'AREA_PICTURE'),
      ...getExportableGlobalRate(globalRate),
      conf: confRef.current,
      customPages: customPagesRef.current,
    });
  };

  const { mutateAsync: uploadImage, isPending: uploadIsPending } = useAnnotatorImageUploadQuery({ onSuccess: uploadImageOnSuccess });

  const isLoading = exportAsPdfPending || uploadIsPending;

  const runExport = (payload: { conf: ExportAreaPictureAnnotationConf; customPages: CustomPage[] }) => {
    confRef.current = payload.conf;
    customPagesRef.current = payload.customPages;
    closeConfirm();
    if (isCropped) {
      return uploadImage({ file: image, id: areaPictureDetails.fileId });
    }
    uploadImageOnSuccess();
  };

  const doAnnotationExport = () => open(<ExportPdfConfDialog onConfirm={runExport} />);

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
