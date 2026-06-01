import { CloudDone } from '@mui/icons-material';
import { CircularProgress, Stack, Typography } from '@mui/material';
import { FC, useEffect, useRef, useState } from 'react';
import { SaveStatusStyle } from './style';

interface SaveStatusProps {
  isSaving: boolean;
  lastSavingDate: string | undefined;
}

type StatusPhase = 'saving' | 'just-saved' | 'idle';

const formatTime = (iso: string) => {
  const date = new Date(iso);
  return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
};

export const SaveStatus: FC<SaveStatusProps> = ({ isSaving, lastSavingDate }) => {
  const [phase, setPhase] = useState<StatusPhase>('idle');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wasSavingRef = useRef(false);

  useEffect(() => {
    if (isSaving) {
      if (timerRef.current) clearTimeout(timerRef.current);
      setPhase('saving');
      wasSavingRef.current = true;
    } else if (wasSavingRef.current) {
      setPhase('just-saved');
      timerRef.current = setTimeout(() => setPhase('idle'), 2000);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isSaving]);

  if (phase === 'idle' && !lastSavingDate) return null;

  if (phase === 'saving') {
    return (
      <Stack direction='row' alignItems='center' gap={0.75} sx={SaveStatusStyle}>
        <CircularProgress size={16} color='inherit' />
        <Typography className='save-status-text'>Enregistrement...</Typography>
      </Stack>
    );
  }

  if (phase === 'just-saved') {
    return (
      <Stack direction='row' alignItems='center' gap={0.75} className='save-status-success' sx={SaveStatusStyle}>
        <CloudDone className='save-status-icon' />
        <Typography className='save-status-text'>Enregistré</Typography>
      </Stack>
    );
  }

  return (
    <Stack direction='row' alignItems='center' gap={0.75} sx={SaveStatusStyle}>
      <CloudDone className='save-status-icon' />
      <Typography className='save-status-text'>Dernière sauvegarde à {formatTime(lastSavingDate!)}</Typography>
    </Stack>
  );
};
