import { PALETTE_COLORS } from '@/common/config/theme';
import { SxProps } from '@mui/material';

export const ProgressBarStyle: SxProps = {
  display: 'flex',
  alignItems: 'center',
  gap: 1.5,
  width: '100%',
  '& .bar-track': {
    flex: 1,
    height: '8px',
    borderRadius: '4px',
    overflow: 'hidden',
    bgcolor: PALETTE_COLORS.cream,
  },
  '& .bar-fill': {
    height: '100%',
    borderRadius: '4px',
    bgcolor: PALETTE_COLORS.neon_orange,
  },
  '& .bar-percent': {
    minWidth: '42px',
    textAlign: 'right',
    fontWeight: 'bold',
    color: PALETTE_COLORS.neon_orange,
  },
};
