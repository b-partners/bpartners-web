import { SxProps } from '@mui/material';

export const SaveStatusStyle: SxProps = {
  opacity: 1,
  transition: 'opacity 0.3s ease',
  '& .save-status-icon': {
    fontSize: 16,
    color: 'text.secondary',
    transition: 'color 0.3s ease',
  },
  '& .save-status-text': {
    fontSize: 12,
    color: 'text.secondary',
    whiteSpace: 'nowrap',
    transition: 'color 0.3s ease',
  },
  '&.save-status-success': {
    '& .save-status-icon': {
      color: 'success.main',
    },
    '& .save-status-text': {
      color: 'success.main',
    },
  },
};
