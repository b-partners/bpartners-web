import { SxProps } from '@mui/material';

export const UseLargerScreenBannerStyle: SxProps = {
  textAlign: 'center',
  px: 3,
  py: 4,
  maxWidth: 440,
  mx: 'auto',
  '& .banner-title': {
    fontSize: '22px',
    fontWeight: 700,
    lineHeight: 1.35,
    whiteSpace: 'normal',
    overflowWrap: 'break-word',
  },
  '& .banner-text': {
    mt: 2,
    fontSize: '16px',
    lineHeight: 1.6,
    whiteSpace: 'normal',
    overflowWrap: 'break-word',
  },
};
