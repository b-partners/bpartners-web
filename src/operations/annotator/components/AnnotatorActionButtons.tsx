import { ScaleCallbacks } from '@bpartners/annotator-component';
import {
  ArrowLeft as ArrowLeftIcon,
  ArrowRight as ArrowRightIcon,
  ZoomIn as ZoomInIcon,
  ZoomInMap as ZoomInMapIcon,
  ZoomOut as ZoomOutIcon,
} from '@mui/icons-material';
import { IconButton, Stack, Tooltip } from '@mui/material';

type TShiftImage = (shiftNumber: number) => void;

export const annotatorButtonsActions = (shiftImage: TShiftImage, showShiftButtons: boolean) => (zoomFunctions: ScaleCallbacks) => {
  const { scaleDown, scaleReste, scaleUp } = zoomFunctions;

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
          <Tooltip onClick={() => shiftImage(-1)} title="Décaler l'image vers le gauche">
            <IconButton>
              <ArrowLeftIcon />
            </IconButton>
          </Tooltip>
          <Tooltip onClick={() => shiftImage(+1)} title="Décaler l'image vers la droite">
            <IconButton>
              <ArrowRightIcon />
            </IconButton>
          </Tooltip>
        </>
      )}
    </Stack>
  );
};
