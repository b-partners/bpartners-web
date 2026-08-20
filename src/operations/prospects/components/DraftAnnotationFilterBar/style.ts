import { SxProps } from '@mui/material';

export const DraftAnnotationFilterBarStyle: SxProps = {
  gap: 1.5,
  bgcolor: 'white',
  borderRadius: '14px',
  p: '16px',
  px: 3,
  mx: 'auto',
  mb: 3,
  width: { xs: '100%', md: '640px' },
  '& .draft-filter-search-icon': {
    fontSize: '28px',
    color: 'text.secondary',
  },
  '& .draft-filter-chip': {
    gap: '6px',
    bgcolor: '#EEF1F4',
    borderRadius: '20px',
    py: '8px',
    px: '14px',
    fontSize: '15px',
    '& .draft-filter-chip-remove': {
      fontSize: '18px',
      cursor: 'pointer',
      opacity: 0,
      transition: 'opacity 0.15s',
    },
    '&:hover .draft-filter-chip-remove': {
      opacity: 1,
    },
  },
  '& .draft-filter-input': {
    flex: 1,
    minWidth: '220px',
    fontSize: '18px',
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
