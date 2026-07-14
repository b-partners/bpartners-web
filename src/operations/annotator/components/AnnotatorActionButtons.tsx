import { useAnnotatorComponentStore } from '@/common/store';
import { useDialog } from '@/common/store/dialog';
import { ZOOM_LEVEL } from '@/constants/zoom-level';
import { ScaleCallbacks } from '@bpartners/annotator-component';
import { AreaPictureDetails, ShiftDirection } from '@bpartners/typescript-client';
import {
  Edit as EditIcon,
  EditOff as EditOffIcon,
  PanTool as PanToolIcon,
  ZoomIn as ZoomInIcon,
  ZoomInMap as ZoomInMapIcon,
  ZoomOut as ZoomOutIcon,
} from '@mui/icons-material';
import { Box, Button, Divider, IconButton, MenuItem, Stack, TextField, Tooltip } from '@mui/material';
import { AnnotationShiftButtons } from './annotator-shift-buttons';
import { AnnotatorResetStateConfirmationDialog } from './AnnotatorResetConfirmationDialog';
import { annotatorActionButtonsStyle, annotatorTopBarStyle } from './style';
import { ThreeDGenerationModeSwitch } from './three-d-generation-mode-switch';

type TShiftImage = (shiftNumber: number, shiftDirection: ShiftDirection) => void;

export interface AnnotatorTopBarConfig {
  areaPicture: AreaPictureDetails;
  mutateAreaPictureDetails: (details: any) => void;
}

const getLabel = (direction: ShiftDirection, plus: boolean) => {
  if (direction === 'RIGHT_LEFT_SIDE') {
    return plus ? ({ label: 'shiftRight', title: 'la droite' } as const) : ({ label: 'shiftLeft', title: 'la gauche' } as const);
  }
  return plus ? ({ label: 'shiftBottom', title: 'le bas' } as const) : ({ label: 'shiftTop', title: 'le haut' } as const);
};

export const annotatorButtonsActions =
  (shiftImage: TShiftImage, showShiftButtons: boolean, topBarConfig?: AnnotatorTopBarConfig) => (zoomFunctions: ScaleCallbacks) => {
    const { scaleDown, scaleReste, scaleUp, xRef, yRef, clickActionValue, toggleClickAction } = zoomFunctions;
    const { open } = useDialog();
    const isEditable = useAnnotatorComponentStore(state => state.isEditable);
    const toggleIsEditable = useAnnotatorComponentStore(state => state.toggleIsEditable);

    const handleZoom = (fn: () => void) => () => {
      if (!clickActionValue) toggleClickAction();
      fn();
    };

    const handleShift = (direction: ShiftDirection, plus: boolean) => {
      const { label, title } = getLabel(direction, plus);
      open(<AnnotatorResetStateConfirmationDialog content={label} onConfirm={() => shiftImage(plus ? 1 : -1, direction)} title={`Décaler vers ${title}`} />);
    };

    const zoomLevel = topBarConfig?.areaPicture?.zoom?.level;
    const otherLayers = topBarConfig?.areaPicture?.otherLayers;
    const isExtended = topBarConfig?.areaPicture?.isExtended;

    const handleChangeZoomLevel = (zl: any) => () => {
      if (topBarConfig) topBarConfig.mutateAreaPictureDetails({ ...topBarConfig.areaPicture, zoomLevel: zl, zoom: { level: zl } });
    };

    const handleChangeLayer = (layer: any) => () => {
      if (topBarConfig) topBarConfig.mutateAreaPictureDetails({ ...topBarConfig.areaPicture, zoomLevel, layerId: layer.id });
    };

    const refocusImage = () => topBarConfig.mutateAreaPictureDetails({ ...topBarConfig.areaPicture, isExtended: !topBarConfig.areaPicture.isExtended });

    const handleRefocusImage = () => {
      open(
        <AnnotatorResetStateConfirmationDialog
          title="Recentrer l'image"
          onConfirm={refocusImage}
          content={!topBarConfig.areaPicture.isExtended ? 'refocusImage' : 'resetRefocusImage'}
        />
      );
    };

    return (
      <>
        {topBarConfig && (
          <Stack sx={annotatorTopBarStyle} className='annotator-top-bar' direction='row' gap={0.5} alignItems='center'>
            <TextField className='top-bar-select' margin='none' size='small' select label='Niveau de zoom' value={zoomLevel}>
              {ZOOM_LEVEL.map(zl => (
                <MenuItem onClick={handleChangeZoomLevel(zl.value)} value={zl.value} key={zl.label}>
                  {zl.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField className='top-bar-select' margin='none' size='small' select label="Source d'image" value={topBarConfig.areaPicture?.actualLayer?.id}>
              {otherLayers?.map((layer: any) => (
                <MenuItem value={layer.id} onClick={handleChangeLayer(layer)} key={layer.id}>
                  {layer.name}
                </MenuItem>
              ))}
            </TextField>
            <Button onClick={handleRefocusImage} className='top-bar-btn' size='small' color='secondary' variant={isExtended ? 'contained' : 'outlined'}>
              {isExtended ? "Réinitialiser l'image" : "Recentrer l'image"}
            </Button>
          </Stack>
        )}
        <Stack className='annotator-info' direction='row' gap={0.5}>
          <Box>
            <p ref={xRef}>x: 0</p>
          </Box>
          <Box>
            <p ref={yRef}>y: 0</p>
          </Box>
        </Stack>
        <Stack sx={annotatorActionButtonsStyle} className='floating-actions' direction='row' gap={0.5} alignItems='center'>
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
          <Divider orientation='vertical' flexItem />
          <Tooltip placement='top' onClick={toggleIsEditable} title={isEditable ? 'Désactiver la modification' : 'Activer la modification'}>
            <IconButton color={isEditable ? 'primary' : 'default'}>{isEditable ? <EditIcon /> : <EditOffIcon />}</IconButton>
          </Tooltip>
          {showShiftButtons && (
            <>
              <Divider orientation='vertical' flexItem />
              <AnnotationShiftButtons handleShift={handleShift} />
            </>
          )}
          <Divider orientation='vertical' flexItem />
          <ThreeDGenerationModeSwitch />
        </Stack>
      </>
    );
  };
