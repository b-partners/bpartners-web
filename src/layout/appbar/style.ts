import { SxProps } from '@mui/material';

export const SecondaryUserBadgeStyle: SxProps = {
  display: 'inline-flex',
  alignItems: 'center',
  ml: 1,
  px: 1.5,
  py: 0.25,
  borderRadius: 4,
  bgcolor: '#f7a88d',
  cursor: 'default',
  verticalAlign: 'middle',
  '& .secondary-user-badge-label': {
    fontSize: '0.8rem',
    fontWeight: 600,
    whiteSpace: 'nowrap',
  },
};
