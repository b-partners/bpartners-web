import { BPButton } from '@/common/components';
import { useRoofAnalyseQuery } from '@/common/fetcher';
import { useCanvasAnnotationContext } from '@/common/store';
import { Polygon } from '@bpartners/annotator-component';
import { AreaPictureDetails } from '@bpartners/typescript-client';
import { FC } from 'react';
import { useGetOne } from 'react-admin';
import { useSearchParams } from 'react-router-dom';

interface AnalyseRoofButtonProps {
  polygons: Polygon[];
  areaPicture: AreaPictureDetails;
}

export const AnalyseRoofButton: FC<AnalyseRoofButtonProps> = ({ polygons, areaPicture }) => {
  const [searchParam] = useSearchParams();
  const { data: prospect } = useGetOne('prospects', { id: searchParam.get('prospectId') });
  const { setPolygons } = useCanvasAnnotationContext();
  const handleSuccess = () => setPolygons([]);
  const { mutate: processDetection, isPending: isProcessing } = useRoofAnalyseQuery(polygons || [], areaPicture, prospect, handleSuccess);

  const handleClick = () => processDetection();

  return <BPButton label='bp.action.process_detection' disabled={polygons.length === 0} onClick={handleClick} isLoading={isProcessing} />;
};
