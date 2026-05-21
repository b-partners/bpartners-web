import { useAnnotatorScreenSwitch } from '@/common/store';
import { Save } from '@mui/icons-material';
import { Button, ButtonProps } from '@mui/material';
import { FC } from 'react';

interface Annotator3DSaveButtonProps extends ButtonProps {
  onSave: () => void;
  isSaving: boolean;
}

export const Annotator3DSaveButton: FC<Annotator3DSaveButtonProps> = ({ onSave, isSaving, ...props }) => {
  const { screen } = useAnnotatorScreenSwitch();

  if (screen !== '3d-annotator') return null;

  return (
    <Button sx={{ minWidth: 300 }} onClick={onSave} startIcon={<Save />} disabled={isSaving} {...props}>
      {isSaving ? 'Sauvegarde en cours...' : 'Sauvegarder'}
    </Button>
  );
};
