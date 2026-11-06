import { SxProps } from '@mui/material';

export const AnnotatorStyle: SxProps = {
  height: '100vh',
  width: '100%',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  '& .annotator-status': {
    px: 2,
    py: 0.5,
    borderBottom: 1,
    borderColor: 'divider',
  },
  '& .annotator-content': {
    flex: 1,
    minHeight: 0,
  },
  '& .annotator-error': {
    p: 3,
    textAlign: 'center',
    color: 'error.main',
  },
};
