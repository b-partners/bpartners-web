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
    gap: '8px',
    bgcolor: '#EEF1F4',
    borderRadius: '10px',
    py: '6px',
    px: '12px',
    '& .draft-filter-chip-text': {
      flexDirection: 'column',
      alignItems: 'flex-start',
      justifyContent: 'center',
      lineHeight: 1.25,
    },
    '& .draft-filter-chip-type': {
      fontSize: '11px',
      fontWeight: 600,
      color: 'text.secondary',
      textTransform: 'uppercase',
      letterSpacing: '0.03em',
    },
    '& .draft-filter-chip-value': {
      fontSize: '14px',
      fontWeight: 500,
      color: 'text.primary',
      maxWidth: '140px',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
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
    '&::-webkit-calendar-picker-indicator': {
      display: 'none',
    },
  },
  '& .draft-filter-menu-button': {
    ml: 'auto',
  },
  '& .draft-filter-search-button': {
    bgcolor: 'primary.main',
    color: 'white',
    '&:hover': {
      bgcolor: 'primary.dark',
    },
  },
};
