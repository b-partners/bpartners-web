import { SxProps } from '@mui/material';

export const DraftAnnotationFilterBarStyle: SxProps = {
  gap: 2,
  flexWrap: 'wrap',
  '& .draft-filter-item': {
    gap: 1,
    bgcolor: 'white',
    borderRadius: '8px',
    p: '10px',
    px: 2,
  },
  '& .draft-filter-input': {
    width: '220px',
    fontSize: '16px',
    outline: 'none',
    border: 'none',
    fontFamily: 'inherit',
  },
};
