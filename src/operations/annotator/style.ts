import { PALETTE_COLORS } from '@/bp-theme';
import { SxProps } from '@mui/material';

export const addressStyle: SxProps = {
  justifyContent: 'space-between',
  alignItems: 'center',
  '& > .MuiStack-root': {
    border: `2px solid ${PALETTE_COLORS['neon_orange']}`,
    width: 'fit-content',
    height: 'fit-content',
    borderRadius: 3,
    display: 'flex',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    color: PALETTE_COLORS['neon_orange'],
    py: 0.5,
    px: 1,
  },
  '& .MuiTypography-root': {
    color: PALETTE_COLORS['neon_orange'],
    fontWeight: 'bold',
    width: 'fit-content',
    height: 'fit-content',
  },
};

export const analyseResultButtonsStyle: SxProps = {
  justifyContent: 'space-between',
  flexWrap: 'wrap',
  '& .MuiButton-root': {
    minWidth: 300,
  },
  '& .draft-save-btn:enabled': {
    background: PALETTE_COLORS.pine,
    color: '#fff',
  },
  '& .export-analyse-btn:enabled': {
    background: PALETTE_COLORS.forest,
    color: '#fff',
  },
};
