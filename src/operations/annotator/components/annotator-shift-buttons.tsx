import { ShiftDirection } from '@bpartners/typescript-client';
import { ArrowLeft as ArrowLeftIcon, ArrowRight as ArrowRightIcon, ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import { IconButton, Paper, Stack, Tooltip } from '@mui/material';
import { FC, useState } from 'react';

interface AnnotationShiftButtonsProps {
  handleShift: (direction: ShiftDirection, plus: boolean) => void;
}

export const AnnotationShiftButtons: FC<AnnotationShiftButtonsProps> = ({ handleShift }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const handleChange = () => setIsExpanded(p => !p);

  return (
    <>
      <Tooltip title={!isExpanded ? 'Ouvrir le menu de décalage.' : 'Fermé le menu de décalage.'} placement='top'>
        <IconButton onClick={handleChange} sx={{ '& svg': { transform: `rotate(${isExpanded ? '180' : 0}deg)` } }}>
          <ExpandMoreIcon />
        </IconButton>
      </Tooltip>
      {isExpanded && (
        <Paper sx={{ position: 'absolute', top: '115%', right: 1, p: 1, borderRadius: 3 }}>
          <Stack justifyContent='center' direction='row' gap={1}>
            <Tooltip placement='left' onClick={() => handleShift('UP_DOWN_SIDE', false)} title="Décaler l'image vers le haut">
              <IconButton sx={{ '& svg': { transform: 'rotate(-90deg)' } }}>
                <ArrowRightIcon />
              </IconButton>
            </Tooltip>
            <Tooltip placement='right' onClick={() => handleShift('UP_DOWN_SIDE', true)} title="Décaler l'image vers le bas">
              <IconButton sx={{ '& svg': { transform: 'rotate(90deg)' } }}>
                <ArrowRightIcon />
              </IconButton>
            </Tooltip>
          </Stack>
          <Stack justifyContent='center' direction='row' gap={1} mt={1}>
            <Tooltip onClick={() => handleShift('RIGHT_LEFT_SIDE', false)} title="Décaler l'image vers la gauche">
              <IconButton>
                <ArrowLeftIcon />
              </IconButton>
            </Tooltip>
            <Tooltip onClick={() => handleShift('RIGHT_LEFT_SIDE', true)} title="Décaler l'image vers la droite">
              <IconButton>
                <ArrowRightIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </Paper>
      )}
    </>
  );
};
