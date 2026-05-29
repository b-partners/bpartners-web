import { ShiftDirection } from '@bpartners/typescript-client';
import { ArrowLeft as ArrowLeftIcon, ArrowRight as ArrowRightIcon, ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import { IconButton, Tooltip } from '@mui/material';
import { FC, useState } from 'react';

interface AnnotationShiftButtonsProps {
  handleShift: (direction: ShiftDirection, plus: boolean) => void;
}

export const AnnotationShiftButtons: FC<AnnotationShiftButtonsProps> = ({ handleShift }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleChange = () => setIsExpanded(p => !p);

  return (
    <>
      <Tooltip title={!isExpanded ? 'Ouvrir le menu de décalage.' : 'Fermer le menu de décalage.'} placement='top'>
        <IconButton onClick={handleChange} className={`shift-toggle ${isExpanded ? 'shift-toggle-expanded' : ''}`}>
          <ExpandMoreIcon />
        </IconButton>
      </Tooltip>
      {isExpanded && (
        <>
          <Tooltip placement='top' onClick={() => handleShift('UP_DOWN_SIDE', false)} title='Décaler vers le haut'>
            <IconButton className='shift-up'>
              <ArrowRightIcon />
            </IconButton>
          </Tooltip>
          <Tooltip placement='top' onClick={() => handleShift('UP_DOWN_SIDE', true)} title='Décaler vers le bas'>
            <IconButton className='shift-down'>
              <ArrowRightIcon />
            </IconButton>
          </Tooltip>
          <Tooltip placement='top' onClick={() => handleShift('RIGHT_LEFT_SIDE', false)} title='Décaler vers la gauche'>
            <IconButton>
              <ArrowLeftIcon />
            </IconButton>
          </Tooltip>
          <Tooltip placement='top' onClick={() => handleShift('RIGHT_LEFT_SIDE', true)} title='Décaler vers la droite'>
            <IconButton>
              <ArrowRightIcon />
            </IconButton>
          </Tooltip>
        </>
      )}
    </>
  );
};
