import { BP_COLOR } from '@/bp-theme';
import { SxProps } from '@mui/material';

export const InfoShowStyle: SxProps = {
  p: 2,
  background: BP_COLOR['solid_grey'],
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'center',
  outline: 'none',
  border: 'none',
  '& .MuiIconButton-root': { cursor: 'auto' },
  '& .MuiTypography-root': { textAlign: 'justify' },
};
