import { useDialog } from '@/common/store/dialog';
import { ScaleCallbacks } from '@bpartners/annotator-component';
import { ShiftDirection } from '@bpartners/typescript-client';
import { Edit as EditIcon, PanTool as PanToolIcon, ZoomIn as ZoomInIcon, ZoomInMap as ZoomInMapIcon, ZoomOut as ZoomOutIcon } from '@mui/icons-material';
import { Box, Divider, IconButton, Stack, Tooltip } from '@mui/material';
import { AnnotationShiftButtons } from './annotator-shift-buttons';
import { AnnotatorResetStateConfirmationDialog } from './AnnotatorResetConfirmationDialog';
import { annotatorActionButtonsStyle } from './style';

type TShiftImage = (shiftNumber: number, shiftDirection: ShiftDirection) => void;

const getLabel = (direction: ShiftDirection, plus: boolean) => {
  if (direction === 'RIGHT_LEFT_SIDE') {
    return plus ? ({ label: 'shiftRight', title: 'la droite' } as const) : ({ label: 'shiftLeft', title: 'la gauche' } as const);
  }
  return plus ? ({ label: 'shiftBottom', title: 'le bas' } as const) : ({ label: 'shiftTop', title: 'le haut' } as const);
};

export const annotatorButtonsActions = (shiftImage: TShiftImage, showShiftButtons: boolean) => (zoomFunctions: ScaleCallbacks) => {
  const { scaleDown, scaleReste, scaleUp, xRef, yRef, clickActionValue, toggleClickAction } = zoomFunctions;
  const { open } = useDialog();

  const handleZoom = (fn: () => void) => () => {
    if (!clickActionValue) toggleClickAction();
    fn();
  };

  const handleShift = (direction: ShiftDirection, plus: boolean) => {
    const { label, title } = getLabel(direction, plus);
    open(<AnnotatorResetStateConfirmationDialog content={label} onConfirm={() => shiftImage(plus ? 1 : -1, direction)} title={`Décaler vers ${title}`} />);
  };

  return (
    <Stack sx={annotatorActionButtonsStyle} direction='row' gap={1}>
      <Stack className='annotator-info' direction='row' gap={1}>
        <Box>
          <p ref={xRef}>x: 0</p>
        </Box>
        <Box>
          <p ref={yRef}>y: 0</p>
        </Box>
      </Stack>
      <Stack className='floating-actions' gap={0.5} direction='row' alignItems='center'>
        <Tooltip placement='top' onClick={handleZoom(scaleUp)} title='Zoom +'>
          <IconButton>
            <ZoomInIcon />
          </IconButton>
        </Tooltip>
        <Tooltip placement='top' onClick={handleZoom(scaleReste)} title='Reset'>
          <IconButton>
            <ZoomInMapIcon />
          </IconButton>
        </Tooltip>
        <Tooltip placement='top' onClick={handleZoom(scaleDown)} title='Zoom -'>
          <IconButton>
            <ZoomOutIcon />
          </IconButton>
        </Tooltip>
        <Divider orientation='vertical' flexItem />
        <Tooltip placement='top' onClick={toggleClickAction} title={!clickActionValue ? 'bouger' : 'délimiter'}>
          <IconButton>{clickActionValue ? <EditIcon /> : <PanToolIcon />}</IconButton>
        </Tooltip>
      </Stack>
      {showShiftButtons && <AnnotationShiftButtons handleShift={handleShift} />}
    </Stack>
  );
};
