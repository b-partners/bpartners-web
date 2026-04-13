import { saveAnnotationsParams, useSaveAnnotations } from '@/common/fetcher';
import { Alert, CircularProgress } from '@mui/material';
import { FC } from 'react';
import { createPortal } from 'react-dom';
import { saveAnnotationsButtonStyle as sx } from './style';

export const SaveAnnotationsButton: FC<saveAnnotationsParams> = props => {
  const { isSaveAnnotationsPending, saveAnnotations, saveAnnotationsError, savedAnnotations } = useSaveAnnotations(props);

  if (!isSaveAnnotationsPending) return null;

  return (
    <>
      {createPortal(
        <Alert sx={sx} icon={<CircularProgress size={25} />}>
          Sauvegarde en cours ...
        </Alert>,
        document.getElementById('root')
      )}
    </>
  );
};
