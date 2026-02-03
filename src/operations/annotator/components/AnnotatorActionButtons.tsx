import { useDialog } from '@/common/store/dialog';
import { stringCutter } from '@/common/utils';
import { ScaleCallbacks } from '@bpartners/annotator-component';
import { AreaPictureDetails } from '@bpartners/typescript-client';
import {
  ArrowLeft as ArrowLeftIcon,
  ArrowRight as ArrowRightIcon,
  Edit as EditIcon,
  PanTool as PanToolIcon,
  ZoomIn as ZoomInIcon,
  ZoomInMap as ZoomInMapIcon,
  ZoomOut as ZoomOutIcon,
} from '@mui/icons-material';
import { Box, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import { AnnotatorResetStateConfirmationDialog } from './AnnotatorResetConfirmationDialog';
import { annotatorActionButtonsStyle } from './style';

type TShiftImage = (shiftNumber: number) => void;

export const annotatorButtonsActions =
  (shiftImage: TShiftImage, showShiftButtons: boolean, areaPictureDetails: AreaPictureDetails) => (zoomFunctions: ScaleCallbacks) => {
    const { scaleDown, scaleReste, scaleUp, xRef, yRef, clickActionValue, toggleClickAction } = zoomFunctions;
    const { open } = useDialog();

    const handleZoom = (fn: () => void) => () => {
      if (!clickActionValue) toggleClickAction();
      fn();
    };

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
      <Stack sx={annotatorActionButtonsStyle} direction='row' gap={1}>
        <Stack className='annotator-info' direction='row' gap={1}>
          <Box>
            <p ref={xRef}>x: 0</p>
          </Box>
          <Box>
            <p ref={yRef}>y: 0</p>
          </Box>
        </Stack>
        <Box className='image-info-container'>
          <Stack className='image-info' direction='row'>
            <Box>
              <Tooltip title={`${areaPictureDetails?.actualLayer?.name} - ${(areaPictureDetails?.actualLayer as any)?.lastUpdatedAt}`}>
                <Typography>
                  {`Source : ${stringCutter(areaPictureDetails?.actualLayer?.name, 25)} - ${(areaPictureDetails?.actualLayer as any)?.lastUpdatedAt}`}
                </Typography>
              </Tooltip>
            </Box>
          </Stack>
        </Box>
        <Stack gap={1} direction='row'>
          <Tooltip onClick={handleZoom(scaleUp)} title='Zoom +'>
            <IconButton>
              <ZoomInIcon />
            </IconButton>
          </Tooltip>
          <Tooltip onClick={handleZoom(scaleReste)} title='Reset'>
            <IconButton>
              <ZoomInMapIcon />
            </IconButton>
          </Tooltip>
          <Tooltip onClick={handleZoom(scaleDown)} title='Zoom -'>
            <IconButton>
              <ZoomOutIcon />
            </IconButton>
          </Tooltip>
          <Tooltip onClick={toggleClickAction} title={!clickActionValue ? 'bouger' : 'délimiter'}>
            <IconButton>{clickActionValue ? <EditIcon /> : <PanToolIcon />}</IconButton>
          </Tooltip>
        </Stack>
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
