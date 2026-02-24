import { SlopeAndHeightStatus } from '@/providers';
import { Info as InfoIcon } from '@mui/icons-material';
import { Alert } from '@mui/material';
import { FC, useState } from 'react';
import { annotationSlopeHeightAlertStyle as style } from './style';

interface AnnotationSlopeHeightAlertProps {
  status: SlopeAndHeightStatus;
}

export const AnnotationSlopeHeightAlert: FC<AnnotationSlopeHeightAlertProps> = ({ status }) => {
  const [isOpen, setIsOpen] = useState(true);

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    ['UNAVAILABLE', 'EXTRACTION_ERROR'].includes(status) &&
    isOpen && (
      <Alert icon={<InfoIcon />} sx={style} severity='error' onClose={handleClose}>
        La pente et la hauteur du bâtiment ne sont pas encore disponibles.
      </Alert>
    )
  );
};
