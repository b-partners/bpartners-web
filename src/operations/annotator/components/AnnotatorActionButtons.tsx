import { useDialog } from '@/common/store/dialog';
import { ScaleCallbacks } from '@bpartners/annotator-component';
import {
  ArrowLeft as ArrowLeftIcon,
  ArrowRight as ArrowRightIcon,
  ZoomIn as ZoomInIcon,
  ZoomInMap as ZoomInMapIcon,
  ZoomOut as ZoomOutIcon,
} from '@mui/icons-material';
import { IconButton, Stack, Tooltip } from '@mui/material';
import { AnnotatorResetStateConfirmationDialog } from './AnnotatorResetConfirmationDialog';

type TShiftImage = (shiftNumber: number) => void;

export const annotatorButtonsActions = (shiftImage: TShiftImage, showShiftButtons: boolean) => (zoomFunctions: ScaleCallbacks) => {
  const { scaleDown, scaleReste, scaleUp } = zoomFunctions;
  const { open } = useDialog();

  const handleShift = (toLeft: boolean) => {
    open(
      <AnnotatorResetStateConfirmationDialog
        content={toLeft ? 'shiftLeft' : 'shiftRight'}
        onConfirm={() => shiftImage(toLeft ? 1 : -1)}
        title={`Décaler vers la ${toLeft ? 'gauche' : 'droite'}`}
      />
    );
  };

  return (
    <Stack direction='row' gap={2}>
      <Tooltip onClick={scaleUp} title='Zoom +'>
        <IconButton>
          <ZoomInIcon />
        </IconButton>
      </Tooltip>
      <Tooltip onClick={scaleReste} title='Reset'>
        <IconButton>
          <ZoomInMapIcon />
        </IconButton>
      </Tooltip>
      <Tooltip onClick={scaleDown} title='Zoom -'>
        <IconButton>
          <ZoomOutIcon />
        </IconButton>
      </Tooltip>
      {showShiftButtons && (
        <>
          <Tooltip onClick={() => handleShift(false)} title="Décaler l'image vers la gauche">
            <IconButton>
              <ArrowLeftIcon />
            </IconButton>
          </Tooltip>
          <Tooltip onClick={() => handleShift(true)} title="Décaler l'image vers la droite">
            <IconButton>
              <ArrowRightIcon />
            </IconButton>
          </Tooltip>
        </>
      )}
    </Stack>
  );
};
