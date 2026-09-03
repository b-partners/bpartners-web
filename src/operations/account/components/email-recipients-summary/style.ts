import { PALETTE_COLORS } from '@/bp-theme';
import { SxProps } from '@mui/material';

export const EmailRecipientsSummaryStyle: SxProps = {
  display: 'flex',
  flexDirection: 'column',
  gap: 0.75,
  mt: 0.5,

  '& .summary-row': {
    display: 'flex',
    flexDirection: 'column',
  },
  '& .summary-type': {
    fontSize: 12,
    fontWeight: 600,
    color: PALETTE_COLORS.pine,
  },
  '& .summary-emails': {
    fontSize: 14,
    color: PALETTE_COLORS.black,
    wordBreak: 'break-word',
  },
  '& .summary-empty': {
    fontSize: 14,
    color: '#9ca3af',
  },
};
