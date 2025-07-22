import { BPButton } from '@/common/components';
import { useInitRoofAnalyseQuery } from '@/common/fetcher';
import { Polygon } from '@bpartners/annotator-component';
import { AreaPictureDetails } from '@bpartners/typescript-client';
import { FC } from 'react';

interface AnalyseRoofButtonProps {
  polygons: Polygon[];
  areaPicture: AreaPictureDetails;
}

export const AnalyseRoofButton: FC<AnalyseRoofButtonProps> = ({ polygons, areaPicture }) => {
  const { mutate: initRoofAnalyse } = useInitRoofAnalyseQuery(areaPicture.address || '', areaPicture);
  return <BPButton label='Analyser la toiture' disabled={polygons.length === 0} />;
};
