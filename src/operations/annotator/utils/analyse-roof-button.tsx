import { BPButton, BPButtonTemplateProps } from '@/common/components';
import { useAnnotatorComponentStore } from '@/common/store';
import { Tooltip } from '@mui/material';
import { FC } from 'react';

interface AnalyseRoofButtonProps extends Omit<BPButtonTemplateProps, 'label'> {
  processDetection: () => void;
  isProcessing: boolean;
}

export const AnalyseRoofButton: FC<AnalyseRoofButtonProps> = ({ isProcessing, processDetection, disabled, ...props }) => {
  const { thereIsRoofPolygon, areaPictureDetails } = useAnnotatorComponentStore();

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
    <Tooltip title='L’image actuelle n’a pas une précision de 5 cm, donc l’analyse ne peut pas être lancée.'>
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
