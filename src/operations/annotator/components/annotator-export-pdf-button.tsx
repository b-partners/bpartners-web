import { useAnnotatorExportAsPdf } from '@/common/fetcher';
import { annotatorStore, useAnnotatorComponentStore } from '@/common/store';
import { getFileUrl } from '@/common/utils';
import { AreaPictureDetails } from '@bpartners/typescript-client';
import { Download } from '@mui/icons-material';
import { Button, ButtonProps, CircularProgress } from '@mui/material';
import { FC } from 'react';
import { calculateGlobalRate, isAfterAnalyse, shiftPolygons } from '../utils';

interface AnnotatorExportPdfButtonProps extends ButtonProps {
  areaPictureDetails: AreaPictureDetails;
}

export const AnnotatorExportPdfButton: FC<AnnotatorExportPdfButtonProps> = ({ areaPictureDetails, disabled, ...rest }) => {
  const annotationInfos = annotatorStore.useAnnotatorInfoStore();
  const { polygonList } = annotatorStore.usePolygonStore();
  const analyseImageFileId = useAnnotatorComponentStore(state => state.analyseImageFileId);

  const { mutate: exportAsPdf, isPending } = useAnnotatorExportAsPdf({});

  const handleExport = () => {
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
      globalRateType: globalRate.type,
      globalRateValue: globalRate.value,
    });
  };

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
