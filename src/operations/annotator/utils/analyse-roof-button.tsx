import { BPButton, BPButtonTemplateProps } from '@/common/components';
import { useRoofAnalyseQuery } from '@/common/fetcher';
import { useAnnotatorComponentStore } from '@/common/store';
import { clearPolygons } from '@/providers';
import { Polygon } from '@bpartners/annotator-component';
import { AreaPictureDetails } from '@bpartners/typescript-client';
import { Tooltip } from '@mui/material';
import { FC } from 'react';
import { useFormContext } from 'react-hook-form';
import { AnnotatorFormState } from './annotations-info-form';

interface AnalyseRoofButtonProps extends Omit<BPButtonTemplateProps, 'label'> {
  polygons: Polygon[];
  areaPicture: AreaPictureDetails;
}

export const AnalyseRoofButton: FC<AnalyseRoofButtonProps> = ({ polygons, areaPicture, disabled, ...props }) => {
  const { thereIsRoofPolygon, areaPictureDetails } = useAnnotatorComponentStore();
  const annotatorFormState = useFormContext<AnnotatorFormState>();
  const handleSuccess = () => {
    annotatorFormState.setValue('polygons', [], { shouldDirty: true });
    annotatorFormState.setValue('annotationInfos', [], { shouldDirty: true });
    clearPolygons(false);
  };
  const { mutate: processDetection, isPending: isProcessing } = useRoofAnalyseQuery(polygons || [], areaPicture, handleSuccess);

  const handleClick = () => processDetection();

  const isPrecisionLevelInCmCorrect = areaPictureDetails?.actualLayer?.precisionLevelInCm === 5;

  return isPrecisionLevelInCmCorrect ? (
    <BPButton
      {...props}
      className='analyse-roof-button'
      label='bp.action.process_detection'
      disabled={disabled || !thereIsRoofPolygon || !isPrecisionLevelInCmCorrect}
      onClick={handleClick}
      isLoading={isProcessing}
    />
  ) : (
    <Tooltip title="L'image actuelle n'est pas de precision de 5cm, impossible de lancer une analyse">
      <BPButton
        {...props}
        className='analyse-roof-button'
        label='bp.action.process_detection'
        disabled={disabled || !thereIsRoofPolygon || !isPrecisionLevelInCmCorrect}
        onClick={handleClick}
        isLoading={isProcessing}
      />
    </Tooltip>
  );
};
