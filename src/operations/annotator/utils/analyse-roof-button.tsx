import { BPButton } from '@/common/components';
import { useRoofAnalyseQuery } from '@/common/fetcher';
import { useCanvasAnnotationContext } from '@/common/store';
import { Polygon } from '@bpartners/annotator-component';
import { AreaPictureDetails } from '@bpartners/typescript-client';
import { Box } from '@mui/material';
import { FC } from 'react';

interface AnalyseRoofButtonProps {
  polygons: Polygon[];
  areaPicture: AreaPictureDetails;
}

export const AnalyseRoofButton: FC<AnalyseRoofButtonProps> = ({ polygons, areaPicture }) => {
  const { setPolygons } = useCanvasAnnotationContext();
  const handleSuccess = () => setPolygons([]);
  const { mutate: processDetection, isPending: isProcessing } = useRoofAnalyseQuery(polygons || [], areaPicture, handleSuccess);

  const handleClick = () => processDetection();

  return (
    <Box height={50}>
      <BPButton
        className='analyse-roof-button'
        label='bp.action.process_detection'
        disabled={polygons.length === 0}
        onClick={handleClick}
        isLoading={isProcessing}
      />
    </Box>
  );
};
