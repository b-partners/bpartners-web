import { saveAnnotationsParams, useSaveAnnotations } from '@/common/fetcher';
import { Check, Error } from '@mui/icons-material';
import { Alert, AlertColor, CircularProgress } from '@mui/material';
import { FC, useEffect, useRef, useState } from 'react';
import { saveAnnotationsButtonStyle as sx } from './style';

const alertConfig = {
  success: {
    color: 'success',
    icon: <Check />,
    text: 'Projet sauvegardé!',
  },
  error: {
    color: 'error',
    icon: <Error />,
    text: "Une erreur s'est produite.",
  },
  loading: {
    color: 'warning',
    icon: <CircularProgress size={25} />,
    text: 'Sauvegarde en cours ...',
  },
};

const getCurrentAlertState = (isLoading: boolean, error: boolean) => {
  if (error) return 'error';
  if (isLoading) return 'loading';
  return 'success';
};

export const SaveAnnotationsButton: FC<saveAnnotationsParams> = props => {
  const { isSaveAnnotationsPending, saveAnnotationsError, savedAnnotations } = useSaveAnnotations(props);
  const [shouldShow, setShouldShow] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (isSaveAnnotationsPending) setShouldShow(true);
    else {
      timeoutRef.current = setTimeout(() => {
        setShouldShow(false);
        clearTimeout(timeoutRef.current);
      }, 2000);
    }
    return () => clearTimeout(timeoutRef.current);
  }, [isSaveAnnotationsPending, savedAnnotations]);

  if (!shouldShow) return null;

  const currentAlertState = getCurrentAlertState(isSaveAnnotationsPending, !!saveAnnotationsError);
  const config = alertConfig[currentAlertState];

  return (
    <Alert sx={sx} icon={config.icon} color={config.color as AlertColor} variant='outlined'>
      {config.text}
    </Alert>
  );
};
