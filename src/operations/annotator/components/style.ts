import { PALETTE_COLORS } from '@/bp-theme';
import { SxProps } from '@mui/material';

export const annotatorActionButtonsStyle: SxProps = {
  '& .MuiIconButton-root': {
    borderRadius: 2,
    background: PALETTE_COLORS['neon_orange'],
    color: PALETTE_COLORS['white'],
  },
};
