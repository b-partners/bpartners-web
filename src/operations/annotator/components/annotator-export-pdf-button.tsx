import { useAnnotatorExportAsPdf } from '@/common/fetcher';
import { annotatorStore, useAnnotatorComponentStore } from '@/common/store';
import { useDialog } from '@/common/store/dialog';
import { getFileUrl } from '@/common/utils';
import { AreaPictureDetails, ExportAreaPictureAnnotationConf } from '@bpartners/typescript-client';
import { Download } from '@mui/icons-material';
import { Button, ButtonProps, CircularProgress } from '@mui/material';
import { FC } from 'react';
import { calculateGlobalRate, isAfterAnalyse, shiftPolygons } from '../utils';
import { ExportPdfConfDialog } from './export-pdf-conf-dialog/ExportPdfConfDialog';

interface AnnotatorExportPdfButtonProps extends ButtonProps {
  areaPictureDetails: AreaPictureDetails;
}

export const AnnotatorExportPdfButton: FC<AnnotatorExportPdfButtonProps> = ({ areaPictureDetails, disabled, ...rest }) => {
  const annotationInfos = annotatorStore.useAnnotatorInfoStore();
  const { polygonList } = annotatorStore.usePolygonStore();
  const analyseImageFileId = useAnnotatorComponentStore(state => state.analyseImageFileId);

  const { mutate: exportAsPdf, isPending } = useAnnotatorExportAsPdf({});
  const { open } = useDialog();

  const runExport = (conf: ExportAreaPictureAnnotationConf) => {
    const globalRate = calculateGlobalRate();
    const shiftedPolygonList =
      !isAfterAnalyse(polygonList) && areaPictureDetails.shiftNb && areaPictureDetails.shiftNb !== 0
        ? shiftPolygons(polygonList, areaPictureDetails, true)
        : polygonList;

    exportAsPdf({
      annotationInfos,
      polygons: shiftedPolygonList,
      address: areaPictureDetails.address,
      imageUrl: getFileUrl(analyseImageFileId ?? areaPictureDetails.fileId, 'AREA_PICTURE'),
      globalRateType: globalRate?.type ?? null,
      globalRateValue: globalRate?.value ?? null,
      conf,
    });
  };

  const handleExport = () => open(<ExportPdfConfDialog onConfirm={runExport} />);

  return (
    <Button
      {...rest}
      onClick={handleExport}
      disabled={isPending || disabled}
      startIcon={isPending ? <CircularProgress size={16} color='inherit' /> : <Download fontSize='small' />}
    >
      Exporter en PDF
    </Button>
  );
};
