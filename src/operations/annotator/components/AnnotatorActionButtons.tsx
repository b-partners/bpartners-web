import { useDialog } from '@/common/store/dialog';
import { parseUrlParams } from '@/common/utils';
import { ScaleCallbacks } from '@bpartners/annotator-component';
import { AreaPictureDetails } from '@bpartners/typescript-client';
import {
  ArrowLeft as ArrowLeftIcon,
  ArrowRight as ArrowRightIcon,
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
    const { scaleDown, scaleReste, scaleUp, xRef, yRef } = zoomFunctions;
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

    const { analyseRoof } = parseUrlParams();
    const shouldAnalyseRoof = analyseRoof === 'true';

    return (
      <Stack sx={annotatorActionButtonsStyle} direction='row' gap={2}>
        <Stack className='annotator-info' direction='row' gap={3}>
          <Box>
            <Box>
              <Typography>
                (GPS {areaPictureDetails?.geoPositions?.[0]?.latitude}, {areaPictureDetails?.geoPositions?.[0]?.latitude})
              </Typography>
            </Box>
            <Box ref={yRef}>
              <Typography>Source : {areaPictureDetails?.actualLayer?.name}</Typography>
            </Box>
          </Box>
          <Box>
            <Box>
              <Typography ref={xRef}>x: 0</Typography>
            </Box>
            <Box>
              <Typography ref={yRef}>y: 0</Typography>
            </Box>
          </Box>
        </Stack>
        <Box>
          {shouldAnalyseRoof && (
            <Box>
              <Typography>Veuillez délimiter votre toiture</Typography>
            </Box>
          )}
        </Box>
        <Stack gap={1} direction='row'>
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
