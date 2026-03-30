import { BPButton, BPButtonTemplateProps } from '@/common/components';
import { annotatorStore, useAnnotatorComponentStore, useAnnotatorScreenSwitch } from '@/common/store';
import { roofGlobalIdRef } from '@/operations/prospects/constants';
import { Tooltip } from '@mui/material';
import { FC } from 'react';

interface AnalyseRoofButtonProps extends Omit<BPButtonTemplateProps, 'label'> {
  processDetection: () => void;
  isProcessing: boolean;
}

export const AnalyseRoofButton: FC<AnalyseRoofButtonProps> = ({ isProcessing, processDetection, disabled, ...props }) => {
  const { areaPictureDetails } = useAnnotatorComponentStore();
  const annotation = annotatorStore.useAnnotatorStore(params => Object.values(params.annotations));
  const { screen } = useAnnotatorScreenSwitch();

  if (screen !== 'annotator') return null;

  const handleClick = () => processDetection();

  const isPrecisionLevelInCmCorrect = areaPictureDetails?.actualLayer?.precisionLevelInCm === 5;
  const isThereARoofPolygon = annotation.length === 1 && annotation[0].annotationInfos.labelType === 'roof';
  const analyseAlreadyDone = annotation.find(a => a.isFirst)?.polygon?.id?.includes(roofGlobalIdRef);

  return isPrecisionLevelInCmCorrect ? (
    <BPButton
      {...props}
      className='analyse-roof-button'
      label='bp.action.process_detection'
      disabled={disabled || !isThereARoofPolygon || !isPrecisionLevelInCmCorrect}
      onClick={handleClick}
      isLoading={isProcessing}
    />
  ) : (
    <Tooltip title='L’image actuelle n’a pas une précision de 5 cm, donc l’analyse ne peut pas être lancée.'>
      <BPButton
        {...props}
        className='analyse-roof-button'
        label='bp.action.process_detection'
        disabled={analyseAlreadyDone || disabled || !isThereARoofPolygon || !isPrecisionLevelInCmCorrect}
        onClick={handleClick}
        isLoading={isProcessing}
      />
    </Tooltip>
  );
};
