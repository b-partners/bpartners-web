import { BPButton, BPButtonTemplateProps } from '@/common/components';
import { useRoofAnalyseQuery } from '@/common/fetcher';
import { useAnnotatorComponentStore, useCanvasAnnotationContext } from '@/common/store';
import { Polygon } from '@bpartners/annotator-component';
import { AreaPictureDetails } from '@bpartners/typescript-client';
import { FC } from 'react';

interface AnalyseRoofButtonProps extends Omit<BPButtonTemplateProps, 'label'> {
  polygons: Polygon[];
  areaPicture: AreaPictureDetails;
}

export const AnalyseRoofButton: FC<AnalyseRoofButtonProps> = ({ polygons, areaPicture, disabled, ...props }) => {
  const { setPolygons } = useCanvasAnnotationContext();
  const { thereIsRoofPolygon } = useAnnotatorComponentStore();
  const handleSuccess = () => setPolygons([]);
  const { mutate: processDetection, isPending: isProcessing } = useRoofAnalyseQuery(polygons || [], areaPicture, handleSuccess);

  const handleClick = () => processDetection();

  return (
    <BPButton
      {...props}
      className='analyse-roof-button'
      label='bp.action.process_detection'
      disabled={disabled || !thereIsRoofPolygon}
      onClick={handleClick}
      isLoading={isProcessing}
    />
  );
};
