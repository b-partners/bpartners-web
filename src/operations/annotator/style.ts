import { SxProps } from '@mui/material';

export const AnnotatorStyle: SxProps = {
  height: '100vh',
  width: '100%',
  overflow: 'hidden',
  '& .annotator-error': {
    p: 3,
    textAlign: 'center',
    color: 'error.main',
  },
};
