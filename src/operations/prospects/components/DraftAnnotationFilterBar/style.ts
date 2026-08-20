import { SxProps } from '@mui/material';

export const DraftAnnotationFilterBarStyle: SxProps = {
  gap: 1,
  bgcolor: 'white',
  borderRadius: '8px',
  p: '10px',
  px: 2,
  width: 'fit-content',
  '& .draft-filter-chip': {
    gap: '4px',
    bgcolor: '#EEF1F4',
    borderRadius: '16px',
    py: '4px',
    px: '10px',
    '& .draft-filter-chip-remove': {
      fontSize: '16px',
      cursor: 'pointer',
      opacity: 0,
      transition: 'opacity 0.15s',
    },
    '&:hover .draft-filter-chip-remove': {
      opacity: 1,
    },
  },
  '& .draft-filter-input': {
    minWidth: '160px',
    fontSize: '16px',
    outline: 'none',
    border: 'none',
    fontFamily: 'inherit',
    bgcolor: 'transparent',
    '&:disabled': {
      color: 'text.disabled',
    },
  },
  '& .draft-filter-menu-button': {
    ml: 'auto',
  },
};
