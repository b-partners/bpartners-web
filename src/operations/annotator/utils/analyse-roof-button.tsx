import { BPButton } from '@/common/components';
import { useRoofAnalyseQuery } from '@/common/fetcher';
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
  const imageUrl = searchParam.get('imgUrl');
  const { mutate: processDetection, isPending: isProcessing } = useRoofAnalyseQuery(polygons || [], areaPicture, imageUrl, prospect);

  const handleClick = () => processDetection();

  return <BPButton label='Analyser la toiture' disabled={polygons.length === 0} onClick={handleClick} isLoading={isProcessing} />;
};
